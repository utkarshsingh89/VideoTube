import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/likes.model.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const getdetails=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscription_details"
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"_id",
                foreignField:"owner",
                as:"video_details"
            }
        },
        {
            $lookup: {
                from: "likes",

    // Step 1: take your video IDs
                 let: { videoIds: "$video_details._id" },

                pipeline: [
                {
                $match: {
                    $expr: {
            // Step 2: filter likes
                    $in: ["$video", "$$videoIds"]
                     }
                }
            }
            ],

            as: "likes"
             }
        },
         {
            $addFields: {
                // ✅ Total Videos
                totalVideos: { $size: "$video_details" },

                // ✅ Total Subscribers
                totalSubscribers: { $size: "$subscription_details" },

                // ✅ Total Likes
                totalLikes: { $size: "$likes" },

                // ✅ Total Views (handle array or number)
                totalViews: {
                    $sum: {
                        $map: {
                            input: "$video_details",
                            as: "video",
                            in: {
                                $cond: {
                                    if: { $isArray: "$$video.views" },
                                    then: { $size: "$$video.views" },
                                    else: { $ifNull: ["$$video.views", 0] }
                                }
                            }
                        }
                    }
                }
            }
        },

        {
            $project: {
                username: 1,
                totalVideos: 1,
                totalSubscribers: 1,
                totalLikes: 1,
                totalViews: 1
            }
        }

    ])
    return res.status(200).json(new apiresponse(299,getdetails,"details fetched successfully"))


})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    if(!req.user._id){
        throw new apierror(400,"user is missing");
    }
    const getvideo=await Video.aggregate([
      {
        $match:{
            owner:new mongoose.Types.ObjectId(req.user._id)
        }
      },
      {
        $sort:{
            createdAt:-1
        }
      },
      {
        $addFields:{
            views:{
                $cond:{
                    if:{$isArray:"$views"},
                    then:{$size:"$views"},
                    else:{$ifnull:["$views",0]}
                }
            }
        }
      },
      {
        $project:{
            thumbnail:1,
            views:1,
            createdAt:1,
            title:1
        }
      }
    ])
    return res.status(200).json(
        new apiresponse(200,getvideo,"video fetched successfully")
    );
})

export {
    getChannelStats, 
    getChannelVideos
    }