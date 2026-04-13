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


//router import
import userRouter from "./route/user.routes.js";
app.use("/users",userRouter);


import videoRouter from "./route/video.routes.js";
app.use("/videos",videoRouter);

import playlistRouter from "./route/playlist.routes.js";
app.use("/playlists",playlistRouter);

import dashboardRouter from "./route/dashboard.routes.js";
app.use("/dashboard",dashboardRouter);

import commentRouter from "./route/comment.routes.js";
app.use("/comments",commentRouter);

import subscriptionRouter from "./route/subscription.routes.js";
app.use("/subscriptions",subscriptionRouter);

import tweetRouter from "./route/tweet.routes.js";
app.use("/tweets",tweetRouter);

import likeRouter from "./route/like.routes.js";
app.use("/likes",likeRouter);

import healthCheckRouter from "./route/healthcheck.routes.js";
app.use("/healthcheck",healthCheckRouter);



export {app};