StudyHub 🎓

StudyHub is a full-stack EdTech platform built with the MERN stack, similar in spirit to Udemy. It allows students to browse, purchase, and learn from courses, and instructors to create and sell their own courses — with a full backend handling auth, payments, media, and email.

Tech Stack
Frontend: React, Redux Toolkit, Tailwind CSS, Axios
Backend: Node.js, Express
Database: MongoDB (via Mongoose)
Auth: JWT + email OTP verification
Payments: Razorpay
Media Storage: Cloudinary (thumbnails, videos)
Email: Nodemailer (verification, password reset, payment receipts)
How It Works

1. Authentication Users sign up as a Student or Instructor. Signup requires an OTP sent to their email for verification. Once verified, login issues a JWT token, which is used to authenticate all further requests and decide what a user is allowed to do (role-based access).

2. Course Creation (Instructor side) Instructors build a course step-by-step: course info → add sections → add video lectures under each section → publish. Videos and thumbnails are uploaded to Cloudinary, and course data (sections, lectures, pricing, category) is stored in MongoDB.

3. Browsing & Purchasing (Student side) Students explore courses by category, view ratings/reviews, and add courses to a cart. Checkout is handled through Razorpay — the backend creates an order, the frontend collects payment, and the backend verifies the payment signature before enrolling the student in the course. A confirmation email is sent automatically.

4. Learning & Progress Tracking Once enrolled, students watch lecture videos and their progress (per video, per course) is saved in the database, so they can pick up where they left off. After completing a course, they can leave a rating and review.

5. Instructor Dashboard Instructors get a dashboard showing their courses, number of students enrolled, and revenue — visualized with charts.

6. Supporting Features

Forgot/reset password flow via emailed secure links
Contact-us form that triggers an automated email response
Admin-level controls for managing categories

## What's Next

I'm actively looking to extend this project with:

Refresh tokens for more secure, longer-lived sessions
A dedicated Admin dashboard (manage users, courses, categories)
Rate limiting on auth/OTP routes to prevent abuse