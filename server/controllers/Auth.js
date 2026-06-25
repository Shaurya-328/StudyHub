// import all the models and the packages that would be needed
const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");

// sendOTP
// our email sender required email and otp as input so this is where we generate otp
exports.sendOTP = async (req , res) =>{

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
             })
    } catch (error) {
        console.log(error);
        // 500 ---> internal server error
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};
