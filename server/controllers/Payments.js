const {instance} = require("../config/razorpay"); ///create config first of razorpay in the config folder
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");


//capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {

    //get courseId and UserID
    const {course_id} = req.body;
    const userId = req.user.id;

    //validation

    //valid courseID
    if(!course_id) {
        return res.json({
            success:false,
            message:'Please provide valid course ID',
        })
    };

    //valid courseDetail
    let course;
    try{
        course = await Course.findById(course_id); // get all the course details from course id
        if(!course) {
            return res.json({
                success:false,
                message:'Could not find the course',
            });
        }

        //user already payed for the course(cannot buy same course again)
        // converting userid as string to objectid because in the course model userid was stored as objectid and not as a string
        const uid = new mongoose.Types.ObjectId(userId);

        // check if the studentsenrolled includes the user id
        if(course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success:false,
                message:'Student is already enrolled',
            });
        }
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            // server error
            success:false,
            message:error.message,
        });
    }
    
    //order create

    // amount and currency are the mandatory parameters to be passed to razorpay(from razorpay documentation)
    const amount = course.price; // price of the course was stored in the course schema
    const currency = "INR";

    // reciept and notes are the optional parameters that can be passed to razorpay
    const options = {
        amount: amount * 100,  // multiply by 100 to get amount(as razorpay returnns amount/100.00)
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId: course_id,
            userId,
        }
    };

    // function call
    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);  // options is passed as the parameter to razorpay
        console.log(paymentResponse);

        //return response
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        });
    }
    catch(error) {
        console.log(error);
        res.json({
            success:false,
            message:"Could not initiate order",
        });
    }
    

};

//verify Signature of Razorpay(returned from webhook) and Server

exports.verifySignature = async (req, res) => {
    const webhookSecret = "12345678";  // signature stored in server

    const signature = req.headers["x-razorpay-signature"]; // signature from razorpay

    // razorpay sends the signature to the server in a hashed format
    // so we need to hash the webhooksecret stored on server also so that we can compare

    // hashes the server webhookSecret
    const shasum =  crypto.createHmac("sha256", webhookSecret); //sha256 is the hashing algo used 
    shasum.update(JSON.stringify(req.body));  // convert shasum object into string
    const digest = shasum.digest("hex");

    // comparing the signatures
    if(signature === digest) {
        console.log("Payment is Authorised");

        // now enroll the course for the user
        // we added userid and courseid in the razorpay call notes parameter
        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
                //fulfil the action

                //find the course and enroll the student in it
                const enrolledCourse = await Course.findOneAndUpdate(
                                                {_id: courseId},
                                                {$push:{studentsEnrolled: userId}},
                                                {new:true},
                );

                // course not found
                if(!enrolledCourse) {
                    return res.status(500).json({
                        success:false,
                        message:'Course not Found',
                    });
                }

                console.log(enrolledCourse);

                //find the student and add the course to their list of enrolled courses 
                const enrolledStudent = await User.findOneAndUpdate(
                                                {_id:userId},
                                                {$push:{courses:courseId}},
                                                {new:true},
                );

                console.log(enrolledStudent);

                // send mail of successful course registeration
                // provide email,title and body as input to the mailsender function
                const emailResponse = await mailSender(
                                        enrolledStudent.email,
                                        "Congratulations from StudyHub",
                                        "Congratulations, you are onboarded into new StudyHub Course",
                );

                console.log(emailResponse);
                return res.status(200).json({
                    success:true,
                    message:"Signature Verified and COurse Added",
                });


        }       
        catch(error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    else {
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        });
    }


};