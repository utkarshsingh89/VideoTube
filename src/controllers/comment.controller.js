import mongoose,{isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Comment } from "../models/comment.model.js";



//add comment
const addComment=asyncHandler(async(req,res)=>{
    const {content}=req.body;
    const videoId=req.params.videoId;
    const userId=req.user._id;
    if(!content){
        throw new apierror(400,"comment is invalid");
    }
    if(!isValidObjectId(videoId)){
        throw new apierror(400,"vide is not valid");
    }
    const comment=await Comment.create({
        content:content,
        video:videoId,
        owner:userId
    })
    if(!comment){
        throw new apierror(501,"comment not added");
    }
    return res.status(200).json(new apiresponse(200,comment,"comment added"))
})
//update comment
const updateComment=asyncHandler(async(req,res)=>{

})


//delete comment
const deleteComment=asyncHandler(async(req,res)=>{
    
})



//get comment form video

const getComment=asyncHandler(async(req,res)=>{
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
})

