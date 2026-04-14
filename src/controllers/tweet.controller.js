import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose,{isValidObjectId} from "mongoose";
import {User} from "../models/user.model.js";

//create tweet
const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body;
    const userId=req.user._id;
    if(!content){
        throw new apierror(400,"content is missing")
    }
    const tweet=await Tweet.create({
        owner:userId,
        content:content
    });
    if(!tweet){
        throw new apierror(500,"tweet creation failed")
    }
    return res.status(201).json(
        new apiresponse(201,"tweet created successfully",tweet)
    );


})
//update tweet
const updateTweet=asyncHandler(async(req,res)=>{
        const {content}=req.body;
        const {tweetId}=req.params;
         if(!isValidObjectId(tweetId)){
            throw new apierror(400,"invalid tweet id")
        }
        if(!content){
            throw new apierror(400,"content is missing")
        }
        const tweet=await Tweet.findOne({_id:tweetId,owner:req.user._id});
        if(!tweet){
            throw new apierror(404,"tweet not found")
        }
        const updatedTweet=await Tweet.findByIdAndUpdate(
            tweetId,
            { $set: { content: content } },
            {new:true}
        );
        if(!updatedTweet){
            throw new apierror(500,"tweet update failed")
        }
        return res.status(200).json(
            new apiresponse(200,"tweet updated successfully",updatedTweet)
        );


});
//delete tweet
const deleteTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
        if(!isValidObjectId(tweetId)){  
            throw new apierror(400,"invalid tweet id")
        }
        const tweet=await Tweet.findOne({_id:tweetId,owner:req.user._id});
        if(!tweet){
            throw new apierror(404,"tweet not found")
        }
        await Tweet.findByIdAndDelete(tweetId);
        return res.status(200).json(
            new apiresponse(200,"tweet deleted successfully")
        );
});
//get tweet
const getUserTweets=asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    if(!isValidObjectId(userId)){
        throw new apierror(400,"invalid user id")
    }
    const tweets=await User.aggregate([
        {
            $match:{_id:new mongoose.Types.ObjectId(userId)}
        },
        {
            $lookup:{
                from:"tweets",
                localField:"_id",
                foreignField:"owner",
                as:"tweets" 
            }
        },
        {
            $unwind:"$tweets"
        },
        {
            $project:{
                _id:"$tweets._id",
                content:"$tweets.content",
                createdAt:"$tweets.createdAt"
            }
        },
        { $sort:{createdAt:-1} },
    ])
    if(tweets.length===0){
        throw new apierror(404,"no tweets found")
    }
    return res.status(200).json(
        new apiresponse(200,tweets,"tweets fetched successfully")
    );

});
export {createTweet,updateTweet,deleteTweet,getUserTweets};
