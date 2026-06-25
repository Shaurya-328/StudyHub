const mongoose = require("mongoose");

// refer class digram to know the details that need to be added in the subsection schema
// // SubSection holds info about a single video inside a section

const subSectionSchema = new mongoose.Schema({
   title:{
      type:String,
      required:true,
      trim:true,
   },
   timeDuration:{
      type:String,
   },
   description:{
    type:String,
    trim:true,
   },
   videoUrl:{
    type:String,
    required:true,
   }
});


module.exports = mongoose.model("SubSection",subSectionSchema);