import mongoose, {isValidObjectId} from "mongoose"

import { apierror } from "../utils/apierror.js"
import { apiresponse } from "../utils/apiresponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { uploadToCloudinary, deleteimagefromcloudnary, deletevideofromcloudnary } from "../utils/cloudinary.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const Page=parseInt(page);
    const Limit=parseInt(limit);
    if(userId && !mongoose.Types.ObjectId.isValid(userId)){
        throw new apierror(4000,"user id is not valid!!");
    }
    const matchstage={};
    if(query){
        matchstage.title={$regex:query,
            $options:"i"
        }
    }
    if(userId){
        matchstage.owner=new mongoose.Types.ObjectId(userId);

    }
    const getvideo= Video.aggregate([
        {
            $match:{
                ...matchstage
            }
        },
        {
            $sort:{
                [sortBy]:sortType=="asc"?1:-1
            }
        }

    ])
    const fetchedvideo=await Video.aggregatePaginate(getvideo,{
        page:Page,
        limit:Limit,
    })
    return res.status(200).json(
        new apiresponse(200,fetchedvideo,"videos fetched successfully")
    )
 
})




const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!req.user?._id){
        throw new apierror(401,"unauthorized access");

    }
    const user=await User.findById(req.user?._id);
    if(!user){
        throw new apierror(404,"user not found");
    }
    if(!title || !description){
        throw new apierror(400,"Title and description are required!!")
    }
    console.log(req.files);
    console.log(req.files.videoFile);
    
    
    
    if (!req.files || !req.files.video || !req.files.thumbnail) {
        throw new apierror(400, "Video file and thumbnail are required");
    }
    const videolocalpath=req.files.video[0].path;
    const thumbnaillocalpath=req.files.thumbnail[0].path;
    if(!videolocalpath||!thumbnaillocalpath){
        throw new apierror(400,"video and thumbnail is required")
    }
    const videoo=await uploadToCloudinary(videolocalpath);
    const thumbnaill=await uploadToCloudinary(thumbnaillocalpath);

    if(!videoo?.url||!thumbnaill?.url){
        throw new apierror(401,"Upload to cloudnaryis failed");
    }
    const duration_video=Math.round(videoo.duration||0);
    const video=await Video.create({
        videoFile:videoo?.url,
        thumbnail:thumbnaill?.url,
        publicID:videoo.public_id,
        thumbnailPublicID:thumbnaill.public_id,
        title,
        description,
        owner:user._id,
        duration:duration_video
    })
    if(!video){
        throw new apierror(404,"failed to publish");
    }
    return res.status(200).json(
        new apiresponse(200,video,"video published succesfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new apierror(40454,"Video not found");
    }
    if(!videoId||!mongoose.Types.ObjectId.isValid(videoId)){
        throw new apierror(4044,"Video not found");
    }
    await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
    });

    const video=await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"userdetails"
            }
        },
        {
            $unwind:"$userdetails"
        },
        {
            $project:{
                username:"$userdetails.username",
                videoFile:1,
                thumbnail:1,
                duration:1,
                views:1,
                title:1,
                description:1
            }
        }

    ])
    if(!video.length){
        throw new apierror(404,"Video not found");
    }
    return res.status(200).json(
        new apiresponse(200,video[0],"video found succesfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
    const {title,description}=req.body;
    if(!title&&!description){
        throw new apierror(400,"title or description is required");
    }
    if(!videoId||!mongoose.Types.ObjectId.isValid(videoId)){
        throw new apierror(401,"invalid video id");
    }
    if(!req.user?._id){
        throw new apierror(401,"unauthorized");
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new apierror(404,"video not found");
    }
    if(req.user._id.toString()!==video.owner.toString()){
        throw new apierror(403,"you are not authorized");
    }
    let thumbnailurl=video.thumbnail;
    if(!req.file){
        throw new apierror(401,"thumbnail required")
    }
    thumbnailurl=await uploadToCloudinary(req.file.path);
    await deleteimagefromcloudnary(video.thumbnailPublicID);
    const updatedvideo=await Video.findByIdAndUpdate(videoId,{
        $set:{
            title:title,
            description:description,
            thumbnail:thumbnailurl?.url,
            thumbnailPublicID:thumbnailurl.public_id
        }
    },{
        new:true
    }
    ).select("title description thumbnail")

    return res.status(200).json(
        new apiresponse(200,updatedvideo,"video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    //check video
    if(!videoId||!mongoose.Types.ObjectId.isValid(videoId)){
        throw new apierror(401,"invalid video id");
    }
    
    //check ownership
    const video=await Video.findById(videoId);
    if(!video){
        throw new apierror(404,"VIDEO NOT FOUND");
    }
    if(video.owner.toString()!==req.user._id.toString()){
        throw new apierror(403,"you are not authorized to delete this video");
    }
    await deletevideofromcloudnary(video.publicID);
    await deleteimagefromcloudnary(video.thumbnailPublicID);
    await video.deleteOne();
    return res.status(200).json(
        new apiresponse(200,null,"video deleted successfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId||!mongoose.Types.ObjectId.isValid(videoId)){
        throw new apierror(401,"invalid video id");
    }
    
    const video=await Video.findById(videoId);
    if(!video){
        throw new apierror(404,"video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
    throw new apierror(403, "Unauthorized");
}
    video.isPublished = !video.isPublished;
    await video.save();
    return res.status(200).json(
        new apiresponse(200,video,"video publish status toggled successfully")
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}