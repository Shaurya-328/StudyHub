const mongoose = require("mongoose");

// Category schema is used to categorize courses (e.g. Web Dev, DSA, AI)
// Helps in filtering/searching courses efficiently

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    courses: [
        // a category can have multiple courses
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
});

module.exports = mongoose.model("Category", categorySchema);