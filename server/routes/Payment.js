// Import the required modules
const express = require("express")
const router = express.Router()

// import the required middlewares and controllers
const { capturePayment, verifySignature } = require("../controllers/Payments")
const { auth, isInstructor, isStudent, isAdmin } = require("../middleware/auth")

router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifySignature", verifySignature)

module.exports = router