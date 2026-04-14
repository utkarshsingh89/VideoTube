import {Router} from'express';
import {
    getChannelStats, 
    getChannelVideos
} from '../controllers/dashboard.controller.js';
import {authenticateJWT} from '../middileware/auth.middileware.js';
const router=Router();
router.use(authenticateJWT);
router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);
export default router;
