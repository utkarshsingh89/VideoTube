import {Router} from 'express';
import { authenticateJWT } from '../middileware/auth.middileware.js';
import {
    addComment,
    updateComment,
    deleteComment,
    getComment
} from '../controllers/comment.controller.js';
const router=Router();
router.use(authenticateJWT);
router.route("/:videoId").post(addComment).get(getComment);
router.route("/:commentId").patch(updateComment).delete(deleteComment);
export default router;