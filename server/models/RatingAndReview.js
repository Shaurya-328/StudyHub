const mongoose = require("mongoose");

// refer class digram to know the details that need to be added in the rating and review schema
// RatingAndReview represents a user's feedback for a course

const ratingAndReviewSchema = new mongoose.Schema({
    user:{
        // details of the user who reviewed
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    rating:{
         type:Number,
         required:true,
    },
    review:{
        type:String,
        required:true,
        trim:true,
    }
});


module.exports = mongoose.model("RatingAndReview",ratingAndReviewSchema);