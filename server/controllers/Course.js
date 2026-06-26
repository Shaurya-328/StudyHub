const Course = require("../models/Course");
const Category = require("../models/Category");
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
        const {courseName, courseDescription, whatYoutWillLearn, price, Category} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYoutWillLearn || !price || !Category || !thumbnail) {
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
        
        // check given Category is valid or not(search if it is stored in database)
        const CategoryDetails = await Category.findById(Category);
        if(!CategoryDetails) {
            return res.status(404).json({
                success:false,
                message:'Category Details not found',
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
            category:CategoryDetails._id,
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
        
        // Update the Category schema by adding the newly created course
        await Category.findByIdAndUpdate(
              CategoryDetails._id,
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



//getAllCourses handler function

exports.showAllCourses = async (req, res) => {
    try {
            //TODO: change the below statement incrementally
            const allCourses = await Course.find({});

            return res.status(200).json({
                success:true,
                message:'Data for all courses fetched successfully',
                data:allCourses,
            })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error:error.message,
        })
    }
}

