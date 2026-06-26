const Section = require("../models/Section");
const Course = require("../models/Course");  // update course after creating section

// creating section handler function
exports.createSection = async (req, res) => {
    try{
        //data fetch
        const {sectionName, courseId} = req.body;

        //data validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }

        //create section
        const newSection = await Section.create({sectionName});

        // Add the new section to the course's content array
		const updatedCourseDetails = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		)
        // populate both section and subsection to get the actual documents
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

        //return response
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails,
        })
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to create Section, please try again",
            error:error.message,
        });
    }
}

// update section handler function
exports.updateSection = async (req,res) => {
    try {

        //data input
        const {sectionName, sectionId} = req.body;

        //data validation
        if(!sectionName || !sectionId) {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        //return response
        return res.status(200).json({
            success:true,
            message:'Section Updated Successfully',
        });

    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to update Section, please try again",
            error:error.message,
        });
    }
};

// delete section handler function
exports.deleteSection = async (req,res) => {
    try {
        //get ID - assuming that we are sending ID in params
        const {sectionId} = req.params

        //use findByIdandDelete
        await Section.findByIdAndDelete(sectionId);

        //TODO[Testing]: do we need to delete the entry from the course schema ??
        
        //return response
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
        })

    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to delete Section, please try again",
            error:error.message,
        });
    }
}