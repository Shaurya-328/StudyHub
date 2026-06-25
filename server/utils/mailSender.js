// since we nodemailer package is used to send emails we need to import it
const nodemailer = require("nodemailer");

// creating a function to send email
// it takes email,title and body as input
const mailSender = async(email,title,body)=>{
    try {
        // Transporter = configured email sender object that connects your app to an email server.
         let transporter = nodemailer.createTransport({
            // all the sensitive info is stored in the env folder
            // ascess it to get the host,user and the paswword
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
         })

         // sending an email
         let info = await transporter.sendMail({
            from: 'StudyHub - By Shaurya',  // sender name
            to: email,
            subject:title,
            html: body,  // html holds the content of the email
            // the details are already provided in tne input
         })
         console.log(info);
         return info;

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender;