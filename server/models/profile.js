// imports the mongoose library
const mongoose = require("mongoose");

// refer class digram to know the details that need to be added in the profile schema

const profileSchema = new mongoose.Schema({
    gender:{
        type:String,
    },
    dateOfBirth:{
        type:Date,
    },
    about:{
        type:String,
        trim:true,
    },
    contactNumber:{
        type:Number,
        trim:true,
    }
});

// used to export the User model so it can be used in other files.
module.exports = mongoose.model("Profile",profileSchema);