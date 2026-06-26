const Category = require("../models/Category");

// we need to create two function -> create Category and get all Categories

// create Category handler function
exports.createCategory = async(req,res) => {
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

        //create Category entry in DB
        const CategoryDetails = await Category.create({
                name:name,
                description:description,
            });
        console.log(CategoryDetails);

        // return response
        return res.status(200).json({
                success:true,
                message:"Category Created Successfully",
            }) 
    } catch (error) {
        // server error
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
} 


// getallcategories handler function

exports.showAllCategories = async(req,res) =>{
    try {
        const allCategories = await Category.find({}, {name:true, description:true}); 
        // returns all Category that has a name and a description

        res.status(200).json({
            success:true,
            message:"All Categories returned successfully",
            allCategories,
        })

    } catch (error) {
        return res.status(500).json({
            // server error
            success:false,
            message:error.message,
        })
    }
}