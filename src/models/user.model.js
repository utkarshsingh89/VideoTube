import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const UserSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            index:true,
            lowercase:true,
            trim:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
           
            lowercase:true,
            trim:true,
        },
        Fullname:{
            type:String,
            required:true,
           
        },
        avtar:{

            type:String,
            required:true,
        },
        cover:{
            type:String,
            
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video",
            }
        ],
        refreshToken:{
            type:String,
        },

        password:{
            type:String,
            required:[  true,"Password is required"],
        }

    },
    {
        timestamps:true,
    }
)
UserSchema.pre("save", async function () {

    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);

});


UserSchema.methods.ispasswordMatch=async function(password){
    return await bcrypt.compare(password,this.password);
}
UserSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        id:this._id,
        username:this.username,
        email:this.email,
        Fullname:this.Fullname,
    },
    process.env.access_token_secret,
    {
        expiresIn:process.env.access_token_expiry,
    }
    

)
}
UserSchema.methods.generateRefreshToken=function(){

     return jwt.sign({
        id:this._id,
      
    },
    process.env.refresh_token_secret,
    {
        expiresIn:process.env.refresh_token_expiry,
    }
)
}

export const User=mongoose.model("User",UserSchema)