const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");

// npm install cloudinary
// using cloudinary when a instructor uploads the thumbnail of the course we dont need to store the image on the server we can upload the image on cloudinary and just store the url of the image in the database
const {uploadImageToCloudinary} = require("../utils/imageUploader");
// use the imageUploader function created in utils folder to upload the image on cloudinary

// we want two functions ----> create course and get all courses

// create course handler function
exports.createCourse = async(req,res) =>{
     try {
        //fetch data 
        const {courseName, courseDescription, whatYoutWillLearn, price, tag} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYoutWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

         // Check if the user is an instructor(validation through middleware)
         // here we need the details of instructor to store while storing the course
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId, {
                accountType: "Instructor",
            })

        if (!instructorDetails) {
              return res.status(404).json({
                  success: false,
                  message: "Instructor Details Not Found",
               })
            }
        
        // check given tag is valid or not(search if it is stored in database)
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails) {
            return res.status(404).json({
                success:false,
                message:'Tag Details not found',
            });
        }

        
        //Upload Image to Cloudinary using the uploadImageToCloudinary function created in the utils folder (soecify the folder name and store it in .env file)
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new Course in database
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYoutWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        })

        //add the new course to the user schema of Instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new:true},
        );
        
        // Update the Tag schema by adding the newly created course
        await Tag.findByIdAndUpdate(
              tagDetails._id,
              {
                $push: {
                    course: newCourse._id,
                },
              },
             { new: true }
         );

        //return response
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse,
        });
        
     } catch (error) {
        console.error(error);
        return res.status(500).json({
            // server error
            success:false,
            message:'Failed to create Course',
            error: error.message,
        })
     }
};




