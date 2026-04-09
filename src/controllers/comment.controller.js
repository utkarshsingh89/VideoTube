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
    const {content}=req.body;
    const {CommentId}=req.params;
    if(!content){
        throw new apierror(400,"comment is missing");
    }
    if(!isValidObjectId(CommentId)){
        throw new apierror(400,"comment is missing");
    }
    const comment=await Comment.findById(CommentId);
    if(!comment){
        throw new apierror(404,"comment is invalid");
    }
    if(comment.owner.toString()!==req.user._id.toString()){
        throw new apierror(403,"you are not authorized");
    }
    comment.content=content ||comment.content;
    await comment.save();

    return res.status(200).json(new apiresponse(200,comment,"update comment successfully"))

})


//delete comment
const deleteComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    if(!isValidObjectId(CommentId)){
        throw new apierror(400,"comment is missing");
    }

    const comment=await Comment.findById(CommentId);
    if(!comment){
        throw new apierror(404,"comment is invalid");
    }
    if(comment.owner.toString()!==req.user._id.toString()){
        throw new apierror(403,"you are not authorized");
    }
     const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id   // 🔐 auth check
    });

    // 3. If not found → either not exist OR not owner
    if (!deletedComment) {
        throw new apiError(404, "Comment not found or unauthorized");
    }
    return res.status(200).json(new apiresponse(200,deleteComment,"comment deleted"));
    
})



//get comment form video

const getComment=asyncHandler(async(req,res)=>{
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
     const Page=parseInt(page);
    const Limit=parseInt(limit);
    if(!isValidObjectId(videoId)){
        throw new apierror(400,"videoid is missing");
    }
    const userId=req.user._id;
    if(!userId||!isValidObjectId(userId)){
        throw new apierror(400,"userid is not valid")
    }
    const getallComment=await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort:{createdAt:-1}
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"commentor_details"
            }
        },
        {
            $unwind:"$commentor_details"
        },
        {
            $project:{

                content:1,
                createdAtL1,
                "commentor_details.username":1,
                "commentor_details.avtar":1,
                "commentor_details.Fullname":1,
                "commentor_details.createdAt":1,

            }
        }
    ])
    if(!getallComment){
        throw new apierror(404,"comment not found");
    }
    const fetchedComment=Comment.aggregatePaginate(getallComment,{
        page:Page,
        limit:Limit
    })
    return res.status(200).json(
        new apiresponse(200,fetchedComment,"comment fetched successfully")
    );


})

