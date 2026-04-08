import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {apierror} from "../utils/apierror.js"
import {apiresponse} from "../utils/apiresponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new apierror(400,"Invalid video id")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new apierror(404,"Video not found")
    }
    const islike=await Like.findOne({video:videoId,likedby:req.user._id});
    if(!islike){
       const like=await Like.create({
        video:videoId,
        likedby:req.user._id
       })
       return res.status(200).json(new apiresponse(200,like,"Like si adde d to video"))
    }else{
        const like=await islike.deleteOne();
        return res.status(200).json(new apiresponse(200,like,"disliked video"));
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new apierror(400,"comment is not valid");
    }
    const islike=await Like.findOne({Comment:commentId,likedby:req.user._id});
    if(!islike){
        const like=await Like.create({
            Comment:commentId,
            likedby:req.user._id
        })
        return res.status(200).json(new apiresponse(200,"likke add ded to comment"));
    }else{
        const like=await islike.deleteOne();
        return res.status(200).json(new apiresponse(200,like,"like is change to dislike"));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new apierror(400,"Tweet is is notvalid");
    }
    const isTweetLike=await Like.findOne({
        tweet:tweetId,
        likedby:req.user._id
    })
    if(!isTweetLike){
        const tweetLike=await Like.create({
            tweet:tweetId,
            likedby:req.user._id
        })
        return res.status(200).json(new apiresponse(200,tweetLike,"Like added to tweet"));
    }else{
        const tweetLike=await isTweetLike.deleteOne();
        return res.status(200).json(new apiresponse(200,tweetLike,"dislike added to tweet"));
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideo=await Like.aggregate([
        {
            $match:{
                likedby:new mongoose.Types.ObjectId(req.user._id),
                video:{$exists:true}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video_details"
            }
        },
        {
            $unwind:"$video_details"
        },
        {
            $lookup:{
                from:"users",
                localField:"video_details.owner",
                foreignField:"_id",
                as:"owner_details"
            }
        },
        {
            $unwind:"$owner_details"
        },
        {
            $project:{
                _id:0,
                video:{
                    thumbnail:"$video_details.thumbnail",
                    title:"$video_details.title"
                },
                owner:{
                    avtar:"$owner_details.avtar",
                    username:"$owner_details.username"
                }
            }
        }
        
       
       
    ])
    if(likedVideo.length==0){
            throw new apierror(404,"no liked video found");
    }
    return res.status(200).json(new apiresponse(200,likedVideo,"liked video fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}