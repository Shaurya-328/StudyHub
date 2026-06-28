// imports the mongoose library
const mongoose = require("mongoose");

// refer class digram to know the details that need to be added in the profile schema

const profileSchema = new mongoose.Schema({
    gender:{
        type:String,
    },
    dateOfBirth:{
        type:String,
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

module.exports = mongoose.model("Profile",profileSchema);