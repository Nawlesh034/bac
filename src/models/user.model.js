import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();

const userSchema =new Schema({
    username:{
        type:String,
        required:true,
        index:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String, // cloudnary url
    },
    coverImage:{
        type:String    // cloudnary url
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"]

    },
    refreshToken:{
        type:String
    }




},{
    timestamps:true // gives created at and updated at
})

userSchema.pre("save",async function(next) {
    if(!this.isModified("password")) next()   // agr modified ni hua hai password toh next pe chle jao

    this.password=await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {

    return await bcrypt.compare(password,this.password)
    
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    }, process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
   
}  // it is for short term
userSchema.methods.generteRefreshToken=function(){
   return jwt.sign({
        _id:this._id,
       
    },process.env.REFRESH_TOKEN_SECRET,
    
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
    
} // it is for long term




export const User =mongoose.model("User",userSchema)