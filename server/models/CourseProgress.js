const mongoose = require("mongoose");

// refer class digram to know the details that need to be added in the CourseProgress schema

const courseProgress = new mongoose.Schema({
   courseId:{
    // stores the id of the course of which you want to see progress
    type:mongoose.Schema.Types.ObjectId,
    ref:"Course",
    // refer to the course model
   },
   // each course contains a series of videos
   completedVideos:[
      // since each couse contains multiple subsections create a array
      {
      type:mongoose.Schema.Types.ObjectId,
      ref:"SubSection",
      // each sub-section refers to a single video
    }
   ]
});

// used to export the courseprogress model so it can be used in other files.
module.exports = mongoose.model("CourseProgress",courseProgress);