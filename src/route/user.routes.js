import {Router} from "express";
import { loginuser, registeruser, logoutuser, refreshaccesstoken, changepassword, getcurrentuser, edituserdetails, avtarupdation, coverupdation, getuserchanneprofile, getWatchHistory} from "../controllers/user.controller.js";
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
router.route("/current-user").get(authenticateJWT,getcurrentuser);
router.route("/update-account").patch(authenticateJWT,edituserdetails);
router.route("/update-avatar").patch(authenticateJWT,upload.single("avtar"),avtarupdation);
router.route("/update-cover").patch(authenticateJWT,upload.single("cover"),coverupdation);
router.route("/C/:username").get(authenticateJWT,getuserchanneprofile);
router.route("/history").get(authenticateJWT,getWatchHistory);
export default router;