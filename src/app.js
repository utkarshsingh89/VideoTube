import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

app.use(cors(
    {
        origin:process.env.cors_origin,
        Credential:true

    }
));
app.use(express.json({
    limit:"16kb"
}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());


//roter import
import userRouter from "./route/user.routes.js";
app.use("/users",userRouter);


import videoRouter from "./route/video.route.js";
app.use("/videos",videoRouter);



export {app};