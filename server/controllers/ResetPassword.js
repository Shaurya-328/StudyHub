
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        //get email from req body
        const email = req.body.email;

        //email validation
        const user = await User.findOne({email: email});
        if(!user) {
            return res.json({
               success:false,
               message:'Your Email is not registered with us'});
        }

        //generate token 
        const token = crypto.randomBytes(20).toString("hex")
        // this function generated a 36 character string which can be treated as token

        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                        {email:email},
                                        {
                                            token:token,
                                            resetPasswordExpires: Date.now() + 5*60*1000,
                                            // reset password token should expire after 5 min
                                        },
                                        {new:true});
        //create url
        const url = `http://localhost:3000/update-password/${token}` /// our frontend is working on port 3000
        // now depending on token different url will open for different users(as we domt want all the users to change pass with the same link)

        //send mail containing the url
        // mailsender requires email,tile and body as input to send mail
        await mailSender(email, 
                        "Password Reset Link",
                        `Password Reset Link: ${url}`);

        //return response
        return res.json({
            success:true,
            message:'Email sent successfully, please check email and change password',
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }  
}

//resetPassword(after resetpassword token generates token and the user clicks on the frontend ui to enter password)
// now we actually need to reset password

exports.resetPassword = async (req, res) => {
    try {
          //data fetch
        const {password, confirmPassword, token} = req.body;

        //validation
        if(password !== confirmPassword) {
            return res.json({
                success:false,
                message:'Password not matching',
            });
        }

        //get userdetails from database using token
        const userDetails = await User.findOne({token: token});

        //if no entry - invalid token
        if(!userDetails) {
            return res.json({
                success:false,
                message:'Token is invalid',
            });
        }

        // check if new password == old password 
        const isSamePassword = await bcrypt.compare(password, userDetails.password);

        if (isSamePassword) {
            return res.status(400).json({
            success: false,
            message: "New password cannot be same as old password",
             });
            }
            
         //token time check (check if the token has already expired)
        if( userDetails.resetPasswordExpires < Date.now()  ) {
                return res.status(403).json({
                    success:false,
                    message:'Token is expired, please regenerate your token',
                });
        }

        //hash new password to store in database
        const hashedPassword = await bcrypt.hash(password, 10);

        //password update in user model
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );

        //return response
        return res.status(200).json({
            success:true,
            message:'Password reset successful',
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        })
    }
}