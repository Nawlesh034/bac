import { ApiError } from "next/dist/server/api-utils/index.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    
    const coverImageLocalPath=req.files?.coverImage[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is not uploaded")
    }
     console.log(avatarLocalPath)
     console.log(coverImageLocalPath)
    // upload on cloudinary

    const avatar=await uploadCloudinary(avatarLocalPath)
    const coverImage= await uploadCloudinary(coverImageLocalPath)



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

export {registerUser}