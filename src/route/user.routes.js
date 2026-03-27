import {Router} from "express";
import { loginuser, registeruser, logoutuser, refreshaccesstoken, changepassword} from "../controllers/user.controller.js";
import {upload} from "../middileware/multer.middilware.js";
import { authenticateJWT } from "../middileware/auth.middileware.js";
const router=Router();
router.route("/register").post(
    upload.fields([
        {name:"Avtar",
        maxCount:1
        },
        {
            name:"Cover",
            maxCount:1
        }
    ]),
    
    registeruser
)
router.route("/login").post(loginuser);

router.route("/logout").post(authenticateJWT,logoutuser);
router.route("/refresh-token").post(refreshaccesstoken);
router.route("/changepassword").post(authenticateJWT,changepassword);
export default router;