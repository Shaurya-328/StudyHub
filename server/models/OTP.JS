const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        // email to which OTP is sent
    },
    otp:{
        // holds the value of the otp
        type:String,
        required:true,
    },
    createdAt:{
       type:Date,
       default:Date.now(), 
       expires:5*60,  // TTL (Time To Live) feature of MongoDB
       // After 5 minutes, MongoDB will automatically delete this document
    }
});


module.exports = mongoose.model("OTP",OTPSchema);