import { asyncHandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/apiresponse.js";


const healthcheck=asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new apiresponse(200,"OK")
    );
})
export {healthcheck};