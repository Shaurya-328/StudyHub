const Category = require("../models/Category");

// we need to create two function -> create Category and get all Categories


function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

// create Category handler function
exports.createCategory = async(req,res) => {
    try {

        // fetch data
        const {name,description} = req.body;

        // validation of data
        if(!name) {
                return res.status(400).json({
                    success:false,
                    message:'All fields are required',
                })
            }

        //create Category entry in DB
        const CategorysDetails = await Category.create({
                name:name,
                description:description,
            });
        console.log(CategorysDetails);

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

exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      {
        name: true,
        description: true,
      }
    ).populate({
      path: "courses",
      match: { status: "Published" },
    });

    return res.status(200).json({
      success: true,
      data: allCategories,
      message: "All Categories returned successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//categoryPageDetails 

exports.categoryPageDetails = async (req, res) => {
    try {

          // fetch data
          const { categoryId } = req.body

          // Get courses for the specified category
           const selectedCategory = await Category.findById(categoryId)
                   // courses is referred in category schema so populate it
                  .populate({
                        path: "courses",
                        match: { status: "Published" },
                        populate: "ratingAndReviews",
                    })
                   .exec()
  
          // Handle the case when the category is not found(validation)
           if (!selectedCategory) {
             return res.status(404).json({ 
                success: false,
                message: "Category not found" })
            }

         // Handle the case when there are no courses
           if (selectedCategory.courses.length === 0) {
               return res.status(404).json({
                   success: false,
                   message: "No courses found for the selected category.",
                })
            }
  
         // Get courses for other categories(suggestions)
          const categoriesExceptSelected = await Category.find({
                 _id: { $ne: categoryId },
            })

           let differentCategory = await Category.findOne(
                categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
                 ._id
              ) 
              .populate({
                   path: "courses",
                   match: { status: "Published" },
               })
              .exec()

      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.courses)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)


      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }