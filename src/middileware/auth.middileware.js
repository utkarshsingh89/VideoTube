import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";
export const authenticateJWT=asyncHandler(async(req,res,next)=>{
    try {
        
const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.split(" ")[1];
            if(!token){
        console.log("❌ No token received");
            throw new apierror(401,"Token not found");
        }
        console.log("TOKEN:", token);
        console.log("AUTH HEADER:", req.headers.authorization);
        console.log("COOKIES:", req.cookies);
        const decoded=jwt.verify(token,process.env.access_token_secret);
        const user=await User.findById(decoded.id).select("-password -refreshToken");
        if(!user){
            console.log("❌ Nouser received");
            throw new apierror(401,"Invalid token");
        }
        req.user=user;
        next();
    } catch (error) {
        console.log("❌ Nod", error);
         console.log("JWT ERROR:", error.message);
        throw new apierror(401, error?.message || "Unauthorized");
    }

   
})