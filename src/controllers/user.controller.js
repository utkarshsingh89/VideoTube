import { User } from "../models/user.model.js";
import { apierror } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import{uploadToCloudinary} from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";


const generateaccessandrefreshtoken=async(userid)=>{
    
    try {

        const user=await User.findById(userid);
        if(!user){
            throw new apierror(404,"User not found")
        }
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    } catch (error) {
         console.log("🔥 TOKEN ERROR:", error); 
        throw new apierror(500,"Token generation failed")
    }
}


const registeruser=asyncHandler(async(req,res)=>{
   const{username,email,password,Fullname}=req.body;
   console.log("email:",email);
   if(!username || !email || !password || !Fullname){
    throw  new apierror(400,"All fields are required")
   }
   const existinguser=await User.findOne({
    $or:[{username},{email}]
   })
   if(existinguser){
    throw  new apierror(409,"username and email is already exists")
   }
   //take the files from  multer
   console.log("reqFiles",req.files);
   const avtarlocalpath=req.files?.Avtar[0]?.path;
   //const coverlocalpath=req.files?.Cover[0]?.path;
   if(req.files&&req.files.Cover&&req.files.Cover.length>0){
    var coverlocalpath=req.files.Cover[0].path;
   }
   //check avtar image is available or not
   if(!avtarlocalpath){
    throw new apierror(400,"Avtar image is required");
   }
   console.log("avtarlocalpath",avtarlocalpath);
   console.log("coverlocalpath",coverlocalpath);


   //upload them to the cloudnary and get the url
   const avtar=await uploadToCloudinary(avtarlocalpath);
    const cover=await uploadToCloudinary(coverlocalpath);
    //create the user in database

    
    const user=await User.create({
        username: username.toLowerCase(),
        email,
        password,
        Fullname,
        avtar:avtar?.url,
        
        cover:cover?.url||"",
    })
  
    
   const usercreated=await User.findById(user._id).select("-password -refreshToken")
if(!usercreated){
    throw new apierror(500,"User Registration Failed")
}
return res.status(201).json({
    statuscode:200,
    data:usercreated,
    message:"User Registered Successfully",
    success:true    
})

})

const loginuser=asyncHandler(async(req,res)=>{
    console.log(req.body);
    
    //take request from body
    //check the username and email is emotry or not
    //validate or find one user fron the usename
    //check the password is match fdrom user or not
    //if password is matched the generate the acces amd refersah token from the user name an d pasdssoeds
    //send the rewfresh and accewsss token to the user
    const {username,password}=req.body;
    if(!username ){
        throw new apierror(400,"username is required");
    }
    const user=await User.findOne({
        username
    })
    if(!user){
        throw new apierror(404,"user not found");
    }
    const isppassword=await user.ispasswordMatch(password);
    if(!isppassword){
        throw new apierror(401,"inavlid passord")
    }
    const {accessToken,refreshToken}=await generateaccessandrefreshtoken(user._id);
   const userloggedin=await User.findById(user._id).select("-password -refreshToken");
   if(!userloggedin){
    throw new apierror(500,"User Login Failed")
   }
   const options={
    httpOnly:true,
    secure:true,
   }
   return res.status(200)
   .cookie("refreshToken",refreshToken,options)
   .cookie("accessToken",accessToken,options)
   .json(
    new apiresponse(
        200,"User logged in succesfully",
        {
            userloggedin,accessToken,refreshToken
        }
    )
   )
})


//logout user

const logoutuser=asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshToken:""}
        }  ,
        {
            new:true,
        }    
    )
    const options={
        httpOnly:true,
        secure:true,
    }
    return res.status(200).clearCookie("refreshToken",options).clearCookie("accessToken",options).json(
        new apiresponse(200,"User logged out successfully",null)
    )
    
})
const refreshaccesstoken=asyncHandler(async(req,res)=>{
        //access refreshtoken
        //decode refresah token
        ////find user with refresh token
        //validate refersh token 
        //generate accesss token and send response

        const incoming_refresh_token=req.cookies.refreshToken||req.body.refreshToken
        if(!incoming_refresh_token){
            throw new apierror(401,"refresh token Not found")
        }
        let decoderefreshtoken
        try {
            decoderefreshtoken=await jwt.verify(incoming_refresh_token,process.env.refresh_token_secret);
    
        } catch (error) {
            throw new apierror(404,"Invalid or expired refresh token")
    
        }
        const user=await User.findById(decoderefreshtoken._id)

        if(!user){
            throw new apierror(401,"user and refreshtoken is mismatch")
        }
        if(incoming_refresh_token!==user.refreshToken){
            throw new apierror(401,"refresh token is expired you need to login")
        }

       const{accessToken,refreshToken}=await generateaccessandrefreshtoken(user._id); 
       const option={
        httpOnly:true,
        secure:true
       }

       return res.status(200)
       .cookie("accesToken",accessToken,option)
       .cookie("refreshToken",refreshToken,option)
       .json
       (
        new apiresponse(200,{accessToken,refreshToken},"token refreshed successfully")
    )
       
})


const changepassword=asyncHandler(async(req,res)=>{
    //old password,new password
    const {oldpassword,newpassword}=req.body
   // console.log("req.user:", req.user);
    console.log(req.body);
    //console.log("oldpassword:", oldpassword);

    if (!req.user?._id) {
        throw new apierror(401, "Unauthorized request");
    }

    const user = await User.findById(req.user._id);
    console.log("user from DB:", user);

    if (!user) {
        throw new apierror(404, "User not found");
    }

    const passwordmatch=await user.ispasswordMatch(oldpassword);
    if(!passwordmatch){
        throw new apierror(401,"password is wrong")
    }
    user.password=newpassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(
        new apiresponse(200,"Password changed successfully",null)
    )
})
const getcurrentuser=asyncHandler(async(req,res)=>{
    return res.status(200).json(
        200,req.user,"Current user fetched successfully"
    )
})
const edituserdetails=asyncHandler(async(req,res)=>{
    const {username,email,Fullname}=req.body;
    if(!username&&!email&&!Fullname){
        throw new apierror(400,"invalid request");
    }
    const updates={}


    if(username){
        const existinguser=await User.findOne({username})
        if(existinguser&&existinguser._id.toString()!==req.user._id.toString()){
            throw new apierror(400,"username already exists")
        }
        updates.username=username;
    }
    if(email){
        const existinguser=await User.findOne({email})
        if(existinguser&&existinguser._id.toString()!==req.user._id.toString()){
            throw new apierror(400,"email already exists")
        }
        updates.email=email;
    }
    if(Fullname){
        
        updates.Fullname=Fullname;
    }
    const updateduser=await User.findByIdAndUpdate(
        req.user._id,
        {$set: updates},
        {new:true}
    ).select("-password")
    res.status(200).json(
        new apiresponse(200,{updateduser},"profile updated successfully")
    )
    
})

const avtarupdation=asyncHandler(async(req,res)=>{
    
    if(!req.file){
        throw new apierror(401,"Avatar file is required")
    }
    const avatarpath=await uploadToCloudinary(req.file.path)
    if(!avatarpath.url){
        throw new apierror(401,"api error in cloudnary")
    }
    const avatarupdate=await User.findByIdAndUpdate(req.user._id,{$set:{
        avtar:avatarpath.url
    }},{new:true}).select("-password")

    res.status(200).json(
        200,
        {avatarupdate},"avatar update successfully"
    )


})
const coverupdation=asyncHandler(async(req,res)=>{
    
    if(!req.file){
        throw new apierror(401,"cover file is required")
    }
    const coverpath=await uploadToCloudinary(req.file.path)
    if(!coverpath.url){
        throw new apierror(401,"api error in cloudnary")
    }
    const coverupdate=await User.findByIdAndUpdate(req.user._id,{$set:{
        cover:coverpath.url
    }},{new:true}).select("-password")

    res.status(200).json(
        200,
        {coverupdate},"cover update successfully"
    )


})



const forgotpassword=asyncHandler(async(req,res)=>{
    const {email}=req.body
    if(!email){
        throw new apierror(401,"email not found")
    } 
})

//get user channel profile

const getuserchanneprofile=asyncHandler(async(req,res)=>{
    const {username}=req.params
    if(!username){
        throw new apierror(400,"username is missing")
    }
    const channel=await User.aggregate([
        {
            $match:{
                username:username.toLowerCase()
            }
        },
        {
        
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"Subscriber"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"SubscribedTo"
            }
        },
        {
            $addFields:{
                subscribercount:{
                    $size:"$Subscriber"
                },
                subscriberTocount:{
                    $size:"$SubscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user._id,"$Subscriber.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }

        },
        {
            $project:{
                Fullname:1,
                username:1,
                isSubscribed:1,
                subscriberTocount:1,
                subscribercount:1,
                avtar:1,
                cover:1
            }
        }
    ])

    if(!channel?.length){
        throw new apierror(404,"channel doesnot exists")
    }
    return res.status(200).json(
        new apiresponse(200,channel[0],"user channel fetched successfully")
    )
})



export { 
    registeruser,
    loginuser,
    logoutuser,
    refreshaccesstoken,
    changepassword,
    getcurrentuser,
    edituserdetails,
    avtarupdation,
    coverupdation,
    getuserchanneprofile
}; 