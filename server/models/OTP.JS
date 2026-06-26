// import the mail sender fuction to use it here 
const mailSender = require("../utils/mailSender");

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

// a function --> to send emails
async function sendVerificationEmail(email,otp){
   try {
      // mailsender function takes email,title and body as input
      // this calls mailsender and sends otp email
     const mailResponse = await mailSender(email,"Verification email from StudyHub",otp);
     console.log("Email sent successfully : ", mailResponse);
   } catch (error) {
      console.log("error occured while sending mail: " ,error);
      throw error;
   }
}

// creating a pre hook
// means send email before storing the otp in the database
OTPSchema.pre("save" , async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("OTP",OTPSchema);