
import mongoose from "mongoose";
import { dbname } from "./constaint.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config();



(async ()=>{
    try {
       await mongoose.connect(`${process.env.db_url}/${dbname}`).then(()=>{
        console.log("Database Connected");
         }).catch((err)=>{
        console.error("Database connection error:", err);
      });
        app.listen(process.env.port,()=>{
            console.log(`app is listening on Port=${process.env.port}`);
            
        })
        
    } catch (error) {
        console.error("error:",error);
        throw error
    }
})()
    