const mongoose = require("mongoose");

// refer class digram to know the details that need to be added in the course schema
// course holds all the info about the course and the course content

const courseSchema = new mongoose.Schema({
   
    courseName:{
        type:String,
        trim:true,
        required:true,
    },
    courseDescription:{
        type:String,
        trim:true,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        // user model holds the info of both instructor and the student
    },
    whatYouWillLearn:{
        type:String,
        trim:true, 
    },
    courseContent:[
        // coursecontent contains multiple sections
        {
          type:mongoose.Schema.Types.ObjectId,
          ref:"Section", 
        }
    ],
    ratingAndReviews:[
        // there can be many rating and reviews
        {
          type:mongoose.Schema.Types.ObjectId,
          ref:"RatingAndReview",
        }
    ],
    price:{
        type:Number,
    },
    thumbnail:{
        type:String,
        // url of the photo
    },
    tag:{
        // used to filter courses
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tag",
    },
    studentsEnrolled:[
        // since there can be multiple users create a array
        {
          type:mongoose.Schema.Types.ObjectId,
          required:true,
          ref:"User",
          // refer to user model for details
        }
    ]
});


module.exports = mongoose.model("Course",courseSchema);