const mongoose = require("mongoose");

// refer class digram to know the details that need to be added in the section schema
// course content holds multiple sections and each section holds multiple sub-sections

const sectionSchema = new mongoose.Schema({
   
     SectionName:{
        type:String,
        required:true,
        trim:true,
     },
     subSection:[
        // create array as there are multiple subsections inside a section
        {
          type:mongoose.Schema.Types.ObjectId,
          ref:"SubSection",
          required:true,
        }
     ],
});


module.exports = mongoose.model("Section",sectionSchema);