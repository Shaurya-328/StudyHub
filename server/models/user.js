// imports the mongoose library
const mongoose = require("mongoose");
const { resetPassword } = require("../controllers/ResetPassword");

// refer class digram to know the details that need to be added in the user schema

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,  // marks the field as mandatory
        trim : true     // Removes extra spaces from the beginning and end.
    },
    lastname:{
       type:String,
       required:true,  
       trim : true,
    },
    email:{
        type:String,
        required:true,  
        trim : true,
    },
    password:{
        type:String,
        required:true,  
    },
    accountType:{
        type:String,
        enum:["Admin","Student","Instructor"], // In Mongoose, enum is used to restrict a field to a fixed set of allowed values.
        required : true,
    },
    active:{
			type: Boolean,
			default: true,
		},
		approved: {
			type: Boolean,
			default: true,
		},
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Profile"
        // used to refer to the profile model
    },
    courses:[
        // since there are multiple courses create a array
        {
          type:mongoose.Schema.Types.ObjectId,
          ref:"Course",
          // used to refer to the course module
        }
    ],
    image:{
        // add image of the user for profile
        type:String,
        required:true,
        // type is string because a url will be added
    },
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    courseProgress:[
        // since there are multiple courses create a array
        {
          type:mongoose.Schema.Types.ObjectId,
          ref:"CourseProgress",
           // used to refer to the course progress module
        }
    ],

    	// Add timestamps for when the document is created and last modified
   },
   { timestamps: true }
);

// used to export the User model so it can be used in other files.
module.exports = mongoose.model("User",userSchema);