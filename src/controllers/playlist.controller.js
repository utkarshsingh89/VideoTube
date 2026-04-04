import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {apierror} from "../utils/apierror.js"
import {apiresponse} from "../utils/apiresponse.js"
import {asyncHandler} from "../utils/asynchandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;

    //TODO: create playlist
    if(!name||!description){
        throw new apierror(400, "Name and description are required");
    }
    const playlistmade=await Playlist.create({
        name:name,
        description:description,
        owner:req.user?._id
    });
    if(!playlistmade){
        throw new apierror(404,"playlist does not create");
    };
    return res
    .status(200)
    .json(
        new apiresponse(200,playlistmade,"playlist created successsfully")
    );
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    //TODO: get user playlists
    if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new apierror(401,"user not found");
    }
    const playlist=await Playlist.find({owner:userId});
    if(playlist.length==0){
        throw new apierror(404,"playlist not found");
    }
    return res
    .status(200)
    .json(
        new apiresponse(200,playlist,"playlist fetched succesfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId||!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new apierror(401,"playlist id is wrong");
    }
    const playlist=await Playlist.findById(playlistId);
    if(!playlist){
        throw new apierror(404,"playlist not found");

    }
    return res
    .status(200)
    .json(
        new apiresponse(200,playlist,"playlist found succesfully")
    );
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId||!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new apierror(401,"Playlist id is wrong");
    }
    if(!videoId||mongoose.Types.ObjectId.isValid(videoId)){
        throw new apierror(402,"if you dont have video than you cant add in playlsit");
    }
    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
        $addToSet:{
            video:videoId
        }
        },
        {
            new:true
        }
    )
    if(!playlist){
        throw new apierror(500,"system acn able to add video into playlist");
    }
    return res
    .status(200)
    .json(new apiresponse(200,))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId||!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new apierror(401,"playlist id is wrong");
    }
    if(!videoId||!mongoose.Types.ObjectId.isValid(videoId)){
        throw new apierror(401,"video id is is wrong");
    }
    const playlist=await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull:{
                video:videoId,
            }
        },
        {
            new:true,
        }
    )
     if (!playlist) {
        throw new apierror(
        400,
        "something went wrong while deleting videos from playlist..."
        );
    }

    return res
        .status(201)
        .json(
        new apiresponse(201, "removed video from playlist successfully", playlist)
        );

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId||!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new apierror(401,"playlist id is not valid");
    }
     const deletePlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletePlaylist) {
        throw new apierror(500, "playlist not found");
    }
    return res
        .status(200)
        .json(new apiresponse(200, "playlist deleted successfully..."));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
     if(!playlistId||!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new apierror(401,"playlist id is not valid");
    }
    if(!name||!description){
        throw new apierror(400,"all fields are required..");
    }
    const playlistupdate=await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name,
            description,
        }
    },{
        new:true,
    })
    if(!playlistupdate){
        throw new apierror(404, "Playlist not found");

    }
    return res.status(200).json(
        new apiresponse(200,playlistupdate,"playlist updated succesfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}