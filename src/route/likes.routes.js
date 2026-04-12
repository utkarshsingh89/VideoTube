import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos } 
    from "../controllers/likes.controller";
import { authenticateJWT } from "../middileware/auth.middileware.js";


const router = Router();

router.use(authenticateJWT); // Apply authenticateJWT middleware to all routes in this file

router.route("/video/:videoId").patch(toggleVideoLike);
router.route("/comment/:commentId").patch(toggleCommentLike);
router.route("/tweet/:tweetId").patch(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
export default router;