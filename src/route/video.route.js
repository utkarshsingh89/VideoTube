import {Router} from "express";
import { getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus } from "../controllers/video.controller.js";
import { authenticateJWT } from "../middileware/auth.middileware.js";
import { upload } from "../middileware/multer.middilware.js";
const router=Router();

router.route("/").get(authenticateJWT,getAllVideos)
.post(authenticateJWT,upload
    .fields([
        {
            name:"video",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),publishAVideo);
router.route("/:videoid").get(authenticateJWT,getVideoById)
.patch(authenticateJWT,upload.single("thumbnail"),updateVideo)
.delete(authenticateJWT,deleteVideo);


router.route("/toggle/publish/:videoid").patch(authenticateJWT,togglePublishStatus);


export default router;