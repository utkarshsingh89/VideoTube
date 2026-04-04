import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controllers.js"
import { authenticateJWT } from '../middileware/auth.middileware.js';

const router = Router();

router.use(authenticateJWT); // Apply authenticateJWT middleware to all routes in this file

router.route("/").post(verifyJWT, createPlaylist)

router
    .route("/:playlistId")
    .get(authenticateJWT, getPlaylistById)
    .patch(authenticateJWT, updatePlaylist)
    .delete(authenticateJWT, deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(authenticateJWT, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(authenticateJWT, removeVideoFromPlaylist);

router.route("/user/:userId").get(authenticateJWT, getUserPlaylists);

export default router;