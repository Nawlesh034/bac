import { ApiError } from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens=async(userID)=>{
     try {
         const user =  await User.findById(userID)
         console.log(user,"it is user")
        const accessToken = user.generateAccessToken()
        
        const refreshToken = user.generteRefreshToken()


           user.refreshToken = refreshToken
          await user.save({validateBeforeSave:false})
          

          return {accessToken,refreshToken}


     } catch (error) {
        throw new ApiError(500,"Something went wrong in generating refresh and access token ")  
     }
}

const registerUser = asyncHandler(async(req,res)=>{
    // get the data from the frontend first
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { fullname,username,email,password}=req.body
    console.log("email",email)
     // validation
    if(fullname===""){
        throw new ApiError(400,"fullname is required!!");
    }
    if(email===""){
        throw new ApiError(400,"Email is required")
    }
    if(!emailRegex.test(email)){
        throw new ApiError(400,"Invalid email format")
    }
    if(username===""){
        throw new ApiError(400,"username is required")
    }
    if(password===""){
        throw new ApiError(400,"Password is required")
    }
    // check if user is already exist or not

   const existedUser= await User.findOne({
        $or:[{username},{email}]

    })
    if(existedUser){
        throw new ApiError(409,"User is already existed")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path
    
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path || null
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is not uploaded")
    }
     console.log(avatarLocalPath)
     console.log(coverImageLocalPath)
    // upload on cloudinary

    const avatar=await uploadCloudinary(avatarLocalPath)
    let coverImage= null;
    if(coverImage){
      coverImage=  await uploadCloudinary(coverImageLocalPath)
    }



    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    //to create a object

   const user=await User.create(
        {
            fullname,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            username:username.toLowerCase()
        }
    )
    // remove password and refresh token field from response
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    console.log(user._id,"paisa")
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    // return res

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user is registered successfully")
    )
    
})

const loginUser = asyncHandler(async(req,res) => {
    
    const {email,username,password}=req.body;
    console.log(email,"username and email")
    console.log(req.body)
    

    if(!(username || email)){
        throw new ApiError(400,"username or email is required")
    }

    const user =await User.findOne(
        {
            $or:[{username},{email}]
        }
    )  // capital user is mongo db object

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid usercredentials")
    }
   const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

   const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

   const options ={
      httpOnly:true,
      secure: true
   }

   return res.status(200).cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(200,{
        user:loggedInUser,accessToken,refreshToken
    },

    "User logged In Successfully"
)
   )
})

const logoutUser = asyncHandler(async(req,res)=>{
  const user=  await User.findByIdAndUpdate(
        req.user._id,
       
        {
            $set:{
                refreshToken:undefined
            }
        },    
        {
                new:true
            }
        
    )
    console.log(user,"nawlesh")
    
   const options ={
    httpOnly:true,
    secure: true
 }

 return res
 .status(200)
 .clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
 .json(new ApiResponse(200,{},"User Logged Out"))


})

const refreshAcessToken =asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorize access")
    }

   try {
     const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user = await User.findById(decodedToken?._id)
     if(!user){
         throw new ApiError(401,"Invalid refresh token")
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"Refresh token is used or expire")
     }
     const options = {
         httpOnly:true,
         server:true
     }
 
     const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
 
     res.
     status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(new ApiError(
         200,
         {accessToken,refreshToken},
         "Access Token is refreshed"
     ))
 
   } catch (error) {
       throw new ApiError(401 ,error?.message || "Invalid Refresh Token")

   }
})

export {registerUser,loginUser,logoutUser,refreshAcessToken}