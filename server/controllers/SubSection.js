// Import necessary modules
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")

// videos can also be uploaded to cloudinary
const { uploadImageToCloudinary } = require("../utils/imageUploader")

// Create a new sub-section 
exports.createSubSection = async (req, res) => {
  try {

    // Extract necessary information from the request body
    const { sectionId, title,timeDuration, description } = req.body
    const video = req.files.videoFile;

    // Check if all necessary fields are provided
    if (!sectionId || !title || !description || !timeDuration || !video) {
      return res.status(400).json({ 
        success: false,
        message: "All Fields are Required" })
    }

    // Upload the video file to Cloudinary
    const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

    // Create a  sub-section
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    })

    // Update the corresponding section with the newly created sub-section
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection")

    // Return response
    return res.status(200).json({
         success: true,
         message:"Sub Section updated Successfully",
         updatedSection,
         })

  } catch (error) {

    console.error("Error creating new sub-section:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// update subsection handler function
exports.updateSubSection = async (req, res) => {
  try {

    // fetch data
    const { sectionId, subSectionId, title, description } = req.body
    const subSection = await SubSection.findById(subSectionId)

    // validation(subsection must exist)
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }

    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}

// delete subsection handler function
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
    
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}