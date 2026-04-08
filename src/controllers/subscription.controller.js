import mongoose, {isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";



import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userID=req.user.id;
    if(!channelId || !isValidObjectId(channelId)){
        throw new apierror(400,"channel id is wrong");
    }
    const isChannel=await User.findById(channelId);
    if(!isChannel){
        throw new apierror(404,"channel not found");
    }
    const issubscribed=await Subscription.findOne({channel:channelId,subscriber:req.user._id});
    let updatechannel;
    if(issubscribed){
        updatechannel=await issubscribed.deleteOne();
        return res.status(200).json(new apiresponse(200,{},"unsubscribed successfully"))
    }else{
        updatechannel=await Subscription.create({
            subscriber:req.user._id,
            channel:channelId
        })
        res.status(200).json(new apiresponse(200,{},"subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!channelId && isValidObjectId(channelId)){
        throw new apierror(200,"channel id is wtroon h")
    }
    const ischannels=await User.findById(channelId);
    if(!ischannels){
        throw new apierror(404,"chhanel is not found")
    }
    const getsubscriber=await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber_details"
            }
        },
        {
            $unwind:"$subscriber_details"
        },
        {
            $project:{
                _id:0,
                username:"$subscriber_details.username",
                avtar:"$subscriber_details.avtar"
            }
        }
    ])
    if(!getsubscriber){
        throw new apierror(400,"subscription failed");
    }
    return res.status(200).json(
        new apiresponse(200,getsubscriber,"subscription fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if(!subscriberId && !isValidObjectId(subscriberId)){
        throw new apierror(400,"subscriberId");
    }
    const getsubscribesto=await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel_details"
            }
        },
        {
            $unwind:"$channel_details"
        },
        {
          $lookup:{
            from:"subscriptions",
            localField:"channel_details._id",
            foreignField:"channel",
            as:"subscriber"
          }

        },
        {
            $project:{
                _id:0, 
                channelId:"$channel_details._id",
                username:"$channel_details.username",
                avtar:"$channel_details.avtar",
                subscribersCount:{$size:"$subscriber"}
            }
        }

    ])
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
