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
        let {courseName, courseDescription, whatYouWillLearn, price, tag, category,status,instructions} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price ||!tag || !category || !thumbnail) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        if (!status || status === undefined) {
			status = "Draft";
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
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails) {
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
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag: tag,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status: status,
			instructions: instructions,
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
              categoryDetails._id,
              {
                $push: {
                    courses: newCourse._id,
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

exports.getAllCourses = async (req, res) => {
    try {
            const allCourses = await Course.find(
                {},
                {
				  courseName: true,
				  price: true,
				  thumbnail: true,
				  instructor: true,
				  ratingAndReviews: true,
				  studentsEnrolled: true,
                }
            ).populate("instructor")
             .exec();
             
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

// getCourseDetails

exports.getCourseDetails = async (req, res) => {
    try {
            //get id
            const {courseId} = req.body;

            //find course details(populate all the fields which use a reference in the course schema so that instead of returning objectid we get the real data )
            const courseDetails = await Course.find(
                                        {_id:courseId})
                                        .populate(
                                            {
                                                path:"instructor",
                                                populate:{
                                                    path:"additionalDetails",
                                                },
                                            }
                                        )
                                        .populate("category")
                                        //.populate("ratingAndreviews")
                                        .populate({
                                            path:"courseContent",
                                            populate:{
                                                path:"subSection",
                                            },
                                        })
                                        .exec();

                //validation
                if(!courseDetails) {
                    return res.status(400).json({
                        success:false,
                        message:`Could not find the course with ${courseId}`,
                    });
                }
                //return response
                return res.status(200).json({
                    success:true,
                    message:"Course Details fetched successfully",
                    data:courseDetails,
                })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}