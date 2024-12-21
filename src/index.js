import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
dotenv.config();
import { app } from './app.js';
import connectDb from "./db/db.js";


connectDb()
.then(()=>{
    app.on("error",(err)=>{
        console.log(`error on listening at `)
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is connected at ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongodb error ",err)
});
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});
// console.log("Cloud Name:", process.env.CLOUDINARY_NAME);
// console.log("API Key:", process.env.CLOUDINARY_API_KEY);
// console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);
// console.log(cloudinary.config())