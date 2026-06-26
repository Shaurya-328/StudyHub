const Tag = require("../models/tags");

// we need to create two function -> create tag and get all tags

// create tag handler function
exports.createTag = async(req,res) => {
    try {

        // fetch data
        const {name,description} = req.body;

        // validation of data
        if(!name || !description) {
                return res.status(400).json({
                    success:false,
                    message:'All fields are required',
                })
            }

        //create Tag entry in DB
        const tagDetails = await Tag.create({
                name:name,
                description:description,
            });
        console.log(tagDetails);

        // return response
        return res.status(200).json({
                success:true,
                message:"Tag Created Successfully",
            }) 
    } catch (error) {
        // server error
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
} 


// getalltags handler function

exports.showAllTags = async(req,res) =>{
    try {
        const allTags = await Tag.find({}, {name:true, description:true}); 
        // returns all tag that has a name and a description

        res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            allTags,
        })

    } catch (error) {
        return res.status(500).json({
            // server error
            success:false,
            message:error.message,
        })
    }
}