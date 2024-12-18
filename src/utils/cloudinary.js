
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

  // Configuration
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadCloudinary = async(localfilepath)=>{
     try {
        if(!localfilepath) return null;

        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type:'auto'
        })
        // file has been successfully uploaded
        console.log("file uploaded", response.url)
        return response

     } catch (error) {
        fs.unlinkSync(localfilepath) // remove the locally file saved because the operation got failed

        return null;
     }
}

export {uploadCloudinary}
    