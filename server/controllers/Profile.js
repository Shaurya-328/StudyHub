const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// update profile handler function
exports.updateProfile = async (req, res) => {
    try{
            //get data
            const {dateOfBirth="", about="", contactNumber} = req.body;
            // DOB AND ABOUT ARE OPTIONAL

            //get userId
            const id = req.user.id;

            //validation
            if(!contactNumber || !id) {
                return res.status(400).json({
                    success:false,
                    message:'All fields are required',
                });
            } 

            //find profile(profile was stored under additional details in the user schema)
            const userDetails = await User.findById(id);
            const profileId = userDetails.additionalDetails;

            // from profile id ascess all the profile data
            const profile = await Profile.findById(userDetails.additionalDetails);

            //update profile
            profile.dateOfBirth = dateOfBirth;
            profile.about = about;
            profile.contactNumber = contactNumber;

            // since the object was already created use the save function to save the details in the database 
            await profile.save();

            //return response
            return res.status(200).json({
                success:true,
                message:'Profile Updated Successfully',
                profile,
            });

    }
    catch(error) {
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
};  


//deleteAccount handler function 

exports.deleteAccount = async (req, res) => {
    try{
        //get id 
        const id = req.user.id;

        //validation
        const userDetails = await User.findById(id);
        if(!userDetails) {
            return res.status(404).json({
                success:false,
                message:'User not found',
            });
        } 

        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

       // unenroll user form all enrolled courses(otherwise even after deleting the enroll count of a course wont decrease)
       for(const courseId of userDetails.courses) {
             await Course.findByIdAndUpdate(
             courseId,
            { $pull: { studentsEnroled: id } },
            { new: true }
           )
        }

        //delete user
        await User.findByIdAndDelete({_id:id});
       
        //return response
        return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        })

    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User cannot be deleted successfully',
        });
    }
};


exports.getAllUserDetails = async (req, res) => {

    try {
        //get id
        const id = req.user.id;

        //validation and get user details(all from user schema and the additional details stored in the profile schema)
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        //return response
        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            data:userDetails,
        });
       
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}