import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT  = asyncHandler(async(req,res,next)=>{
      
   try {
    console.log(req.headers)
    console.log(req.cookies.accessToken)
    let token = req.cookies?.accessToken || (req.headers["authorization"] && req.headers["authorization"].startsWith("Bearer ") ? req.headers["authorization"].replace("Bearer ", "") : null);

      console.log(token,'nawlesh')
       
      if(!token){
       throw new ApiError(401,"Unautorize Request")
      }
  
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   
  
     const user =await User.findById(decodedToken?._id).select("-password -refreshToken")
  
     if(!user){
       // TODO discuss about frontend
       throw new ApiError(401,"Invalid Access Token")
     }
  
     req.user=user;
     next()
   } catch (error) {
       throw new ApiError(401,error?.message || "Invalid access Token") 
   }

})