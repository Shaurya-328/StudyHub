const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")

// npm install cloudinary
// using cloudinary when a instructor uploads the thumbnail of the course we dont need to store the image on the server we can upload the image on cloudinary and just store the url of the image in the database
const {uploadImageToCloudinary} = require("../utils/imageUploader");
// use the imageUploader function created in utils folder to upload the image on cloudinary

// we want two functions ----> create course and get all courses

// create course handler function
exports.createCourse = async(req,res) =>{
     try {
        //fetch data 
        let {courseName, courseDescription, whatYouWillLearn, price, tag: _tag, category,status,instructions: _instructions} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)

        console.log("tag", tag)
        console.log("instructions", instructions)

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

exports.getFullCourseDetails = async (req, res) => {
    try {
            console.log("===== getFullCourseDetails =====");
            console.log(req.body);
            //get id
            const {courseId} = req.body;
            const userId = req.user.id;

            console.log("Course ID:", courseId);
            console.log("User ID:", userId);

            //find course details(populate all the fields which use a reference in the course schema so that instead of returning objectid we get the real data )
            const courseDetails = await Course.findById(courseId)
                                        .populate(
                                            {
                                                path:"instructor",
                                                populate:{
                                                    path:"additionalDetails",
                                                },
                                            }
                                        )
                                        .populate("category")
                                        .populate("ratingAndReviews")
                                        .populate({
                                            path:"courseContent",
                                            populate:{
                                                path:"subSection",
                                            },
                                        })
                                        .exec();

                //validation
                if(!courseDetails) {
                    return res.status(404).json({
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

// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates[key]) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

 // Get One Single Course Details
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()
    // console.log(
    //   "###################################### course details : ",
    //   courseDetails,
    //   courseId
    // );
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    if (courseDetails.status === "Draft") {
      return res.status(403).json({
        success: false,
        message: `Accessing a draft course is forbidden`,
      })
    }

    return res.status(200).json({
      success: true,
      data: courseDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}