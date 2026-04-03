import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";


cloudinary.config({
    
    
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});
const uploadToCloudinary=async(localpath)=>{
    try {
        if(!localpath) return null;
        const response=await cloudinary.uploader.upload(localpath,{
            resource_type:"auto",
        })
        console.log("File uploaded successfully",response.url);
        fs.unlinkSync(localpath);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localpath);
        console.error("Error uploading file to Cloudinary:",error);
        throw error;
    }
}

const deleteimagefromcloudnary=async(publiID)=>{
    try {
        if(!publiID) return "failed";
        const response=await cloudinary.uploader.destroy(publiID,{
            resource_type:"image"
        })
        return response;

        
    } catch (error) {
        console.error("cloud image delete failed:",error);
        
    }
}
const deletevideofromcloudnary=async(publiID)=>{
    try {
        if(!publiID) return "failed";
        const response=await cloudinary.uploader.destroy(publiID,{
            resource_type:"video"
        })
        return response;

        
    } catch (error) {
        console.error("cloud video delete failed:",error);
        
    }
}
export {uploadToCloudinary,deleteimagefromcloudnary,deletevideofromcloudnary};