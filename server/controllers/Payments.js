const { instance } = require("../config/razorpay") // create config first of razorpay in the config folder
const Course = require("../models/Course")
const User = require("../models/User")
const CourseProgress = require("../models/CourseProgress")
const mailSender = require("../utils/mailSender")
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const mongoose = require("mongoose")
const crypto = require("crypto")

// capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  // get courseIds and UserID
  const { courses } = req.body
  const userId = req.user.id

  // validation
  if (!courses || courses.length === 0) {
    return res.json({
      success: false,
      message: "Please Provide Course ID",
    })
  }

  let total_amount = 0

  // validate every course
  for (const course_id of courses) {
    try {
      // get all the course details from course id
      const course = await Course.findById(course_id)

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Could not find the Course",
        })
      }

      // converting userid as string to objectid
      const uid = new mongoose.Types.ObjectId(userId)

      // user already purchased this course
      if (course.studentsEnrolled.includes(uid)) {
        return res.status(400).json({
          success: false,
          message: "Student is already enrolled",
        })
      }

      // Add the price of every course
      total_amount += course.price
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  // create razorpay order
  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  }

  try {
    // initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options)

    console.log(paymentResponse)

    return res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY,
      data: paymentResponse,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      success: false,
      message: "Could not initiate order",
    })
  }
}

// verify payment
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courses,
  } = req.body

  const userId = req.user.id

  // validation
  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(400).json({
      success: false,
      message: "Payment Failed",
    })
  }

  // create signature
  const body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

  // compare signatures
  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Payment Verification Failed",
    })
  }

  // enroll student in all purchased courses
  await enrollStudents(courses, userId, res)

  return res.status(200).json({
    success: true,
    message: "Payment Verified Successfully",
  })
}

// send payment success email
exports.sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body

    const userId = req.user.id

    if (!orderId || !paymentId || !amount || !userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      })
    }

    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      "Payment Received",
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )

    return res.status(200).json({
      success: true,
      message: "Payment Success Email Sent",
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      success: false,
      message: "Could not send payment email",
    })
  }
}

// enroll student in purchased courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please provide Course IDs and User ID",
    })
  }

  for (const courseId of courses) {
    try {
      // find the course and enroll the student
      const enrolledCourse = await Course.findByIdAndUpdate(
        courseId,
        {
          $push: {
            studentsEnrolled: userId,
          },
        },
        {
          new: true,
        }
      )

      if (!enrolledCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        })
      }

      console.log("Updated Course:", enrolledCourse)

      // create course progress
      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })

      // add course to student
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        {
          new: true,
        }
      )

      console.log("Updated Student:", enrolledStudent)

      // send enrollment mail
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log(emailResponse)
    } catch (error) {
      console.log(error)

      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
}