// import all the models and the packages that would be needed
const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const  bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// sendOTP
// our email sender required email and otp as input so this is where we generate otp
exports.sendotp = async (req , res) =>{

    try {
           // fetch email from request body
           const {email} = req.body;

           // check if user already exist
           const checkUserPresent = await User.findOne({email});

             // if user already present
            if(checkUserPresent){
                 // 401 ---> unauthorised
                  return res.status(401).json({
                  success:false,
                  message:"User already registered",
            })
            }

            // generate otp
            // to generate otp install npm otp generator package(already done)
            var otp = otpGenerator.generate(6,{
                // give the length of otp and the conditions to generate the otp
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,

                // we dont want alphabets and special chars in otp
            })
            console.log("OTP generated: ",otp);

            // the otp generated must be unique
            // check unique otp or not
            // if found in database --> not unique
            let result = await OTP.findOne({otp: otp});

            // if not unique keep on generating the otp until a unique otp is generated
            while(result){
                otp = otpGenerator.generate(6,{

                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,

                });
                // now again check unique or not
                result = await OTP.findOne({otp: otp});
            }

            // after creating a unique otp we need to make the entry of otp in the database
            // refer the otp model to check the properties of the otp that need to be entered
            const otpPayload = {email,otp} ;
            // now even if dont enter the date while creating a entro of the otp it gets automatically assigned due to the deault date.now() property assigned to  craetedat in the otp model

            // create an entry for database
            const otpBody =  await OTP.create(otpPayload);
            console.log(otpBody);
             
            // return response successfully
             res.status(200).json({
                success:true,
                message:'OTP Sent Successfully',
                otp,
             })
    } catch (error) {
        console.log(error.message);
        // 500 ---> internal server error
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};


// sign up
exports.signup = async (req,res) =>{
     try {
        
    // step-1 fetch data from req body(detils entered by the user during sign up like name,age etc)
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    } = req.body

    // step-2 validating the data

    // check if some data is absent
    if(!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp){
        // no need to add accounttype since it is a tab so it would automatically assign a value as user or instructor
        return res.status(400).json({
            success:false,
            message:"All fields are required",
        })
    }

    //check whether the pass and confirm pass are same 
    if(password !== confirmPassword){
        return res.status(400).json({
            // 400 ---> invalid data 
            success:false,
            message:"Password and Confirm Password does not match, please Try again",
        })
    }

    // check is user already present or not
    const existingUser = await User.findOne({email});

    // if present return (cannot signup)
    if(existingUser){
        return res.status(400).json({
            // 400 ---> invalid data 
            success:false,
            message:"User is already registered",
        })
    }

    // step-3 find most recent otp for the user 
    // use the CreatedAt property of the otp to get most recent one
    const response = await OTP.find({email}).sort({createdAt:-1}).limit(1); 
    console.log(response);

    // validate OTP
    if(response.length==0){
        // otp not found 
        return res.status(400).json({
            success:false,
            message:"OTP not found",
        })
    }else if(otp !== response[0].otp){
        // invalid otp entered by user (does not match from the otp stored in database)
        return res.status(400).json({
            success:false,
            message:"Invalid OTP",
        })
    }

    // once the otp is correct
    // we need to create a entry of the user in the database

    // hash password to store in database
    // using npm bcrypt to hash password
    const hashedPassword = await bcrypt.hash(password,10);
    // 10 just indicates the number of rounds of hashing

    // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

    // create profile document also because additionaldetails refer profile schema
    const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType: accountType,
        approved: approved,
        additionalDetails:profileDetails._id,
        // iamge uses a external api which genertes a image for the profile from the firstname and the lastname initials
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // generate the response
    return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            user,
        });
     } catch (error) {
        console.log(error);
        return res.status(500).json({
            // 500 ---> server error
            success:false,
            message:"User cannot be registrered. Please try again",
        })
     }
}



// login 
exports.login = async (req,res) =>{
    try {
        // get data from req body
        const {email, password} = req.body;

        // validation data(check for unfilled fields)
        if(!email || !password) {
            return res.status(400). json({
                success:false,
                message:'All fields are required, please try again',
            });
        }

        // check user already exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
       // additionalDetails stores a Profile ObjectId.
       // populate("additionalDetails") retrieves the corresponding
       // Profile document and attaches it to the user object.

        if(!user){
            // user not found in database
            return res.status(401).json({
                success:false,
                message:"User is not registered . Sign up"
            })
        }


        // generate JWT after password matching (since password is hashed we need to use bcrypt)
        // compare if the input password match with the one in the database
            if(await bcrypt.compare(password, user.password)) {
                // password matched
            const payload = {
                email: user.email,
                id: user._id,
                role:user.role,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                // JWT_Secret is used so that no one can change the details of the jwt token issued by the server
                expiresIn:"2h", // after that user needs to login again with password
            });
            // add the token to the user profile
            user.token = token;

            // remove password before sending user data to frontend
            user.password= undefined;

            //create cookie and send response
            const options = {
                // how the browser stores the cookie
                expires: new Date(Date.now() + 3*24*60*60*1000),  // valid for 3 days
                httpOnly:true,
            }
            // create a cookie named "token" that stores the JWT
            res.cookie("token", token, options).status(200).json({
                // send the cookie (the cookie stores the jwt token in the user browser)
                success:true,
                token,  // jwt token
                user,   // user profile after removing the password
                message:'Logged in successfully',
            })

        }
        else {
            // password did not match
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }  
    }
        catch (error) {
         console.log(error);
         return res.status(500).json({
            success:false,
            message:'Login Failure, please try again',
        });
    }
}

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword, confirmNewPassword} = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(oldPassword,userDetails.password)

    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res.status(401).json({ 
        success: false, 
        message: "The password is incorrect"
      })
    }

    // Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

        // new password should not be equal to the old password
        if (oldPassword === newPassword) {
            return res.status(400).json({
            success: false,
            message: "New password cannot be the same as the old password",
        }); 
}

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true } // without new==true findidbyupdate would send the old copy instead of the updated one
    )

    // Send notification email(that password has been updated)
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )

      console.log("Email sent successfully:", emailResponse.response)

    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res.status(200).json({ 
        success: true, 
        message: "Password updated successfully" 
    })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}
