const mongoose = require("mongoose");

// Tag schema is used to categorize courses (e.g. Web Dev, DSA, AI)
// Helps in filtering/searching courses efficiently

const tagsSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        trim:true,
    },
    course:[
        // since there are multiple courses create a tag
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        }
    ]
});


module.exports = mongoose.model("Tag",tagsSchema);