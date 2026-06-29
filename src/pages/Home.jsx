import React from 'react'
import { FaArrowRight } from "react-icons/fa" // importing arrow image
import { Link } from "react-router-dom"


// Component Imports
import HighlightText from '../components/core/HomePage/HighlightText'
import CTAButton from "../components/core/HomePage/Button"
import CodeBlocks from "../components/core/HomePage/CodeBlocks"
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection"
import TimelineSection from "../components/core/HomePage/TimelineSection"
import Footer from "../components/common/Footer"
import ReviewSlider from "../components/common/ReviewSlider"
import ExploreMore from "../components/core/HomePage/ExploreMore"
import InstructorSection from "../components/core/HomePage/InstructorSection"

// Image and Video Import
import Banner from "../assets/Images/banner.mp4"

const Home = () => {
  return (
    <div>

      {/*Section1 ----> dark background */}
      <div className='relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center 
      text-white justify-between gap-8'>

        {/* creating sign up button */}
        <Link to={"/signup"}> {/* when we click it takesd us to the signup route*/}
          <div className=' group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200
            drop-shadow-[0_1.5px_rgba(255,255,255,0.25)]
            transition-all duration-200 hover:scale-95 hover:drop-shadow-none w-fit' >
            
            <div className='flex flex-row items-center gap-2 rounded-full px-10 py-[5px]
              transition-all duration-200 group-hover:bg-richblack-900'>
              <p>Become an Instructor</p>
              <FaArrowRight />   {/* arrow image */}
            </div>

          </div>
        </Link>

        {/* creating heading below sign up  */}
        <div className='text-center text-4xl font-semibold'>
          Empower Your Future with
          <HighlightText text={"Coding Skills"} />
        </div> 

        {/* content below heading */}
        <div className=' mt-3 w-[90%] text-center text-lg font-bold text-richblack-300'>
          With our online coding courses, you can learn at your own pace, from anywhere in the world, and get access to a wealth of resources, including hands-on projects, quizzes, and personalized feedback from instructors. 
        </div>

        {/* create two button --> learn more and book a demo */}
        <div className='flex flex-row gap-7 mt-8'>
             
          {/* creating a component for button */}
          <CTAButton active={true} linkto={"/signup"}> 
            {/* children is learn more of this button */}
            Learn More
          </CTAButton>
 
          <CTAButton active={false} linkto={"/login"}> 
            {/* children is Book a demo of this button */}
            Book a Demo
          </CTAButton>
        </div>

        {/* SHOW VIDEO ON HOMEPAGE */}
        <div className='mx-3 my-7 shadow-[10px_-5px_50px_-5px] shadow-blue-200'>
          <video
            className='shadow-[20px_20px_rgba(255,255,255)]'
            muted
            loop
            autoPlay
          >
            <source src={Banner} type="video/mp4" />
          </video>
        </div>

        {/* Code Section 1 */}
        <div>
          {/* create component since we need to make two similiar code sections */}
          <CodeBlocks
            // provide the values of input props req for the component
            position={"lg:flex-row"}
            heading={
              <div className='text-4xl font-semibold'>
                Unlock your
                <HighlightText text={"coding potential"} />
                with our online courses.
              </div>
            }
            subheading={
              "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
            }
            ctabtn1={{
              btnText: "Try it Yourself",
              link: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn More",
              link: "/signup",
              active: false,
            }}
            codeblock={`<!DOCTYPE html>\n <html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
            backgroundGradient={<div className="codeblock1 absolute"></div>}
            codeColor={"text-yellow-25"}
          />
        </div>

        {/* Code Section 2 */}
        <div>
          <CodeBlocks 
            position={"lg:flex-row-reverse"}
            heading={
              <div className='w-[100%] text-4xl font-semibold lg:w-[50%]'>
                Start
                <HighlightText text={"coding in seconds"} />
              </div>
            }
            subheading={
              "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
            }
            ctabtn1={{
              btnText: "Continue Lesson",
              link: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn More",
              link: "/signup",
              active: false,
            }}
            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
            backgroundGradient={<div className="codeblock2 absolute"></div>}
            codeColor={"text-white"}
          />
        </div>

        {/* Explore Section */}
        <ExploreMore />
      </div>

      {/*Section 2 ----> white background */}
      <div className="bg-pure-greys-5 text-richblack-700">

        {/* setting up white background image */}
        <div className="homepage_bg h-[320px] pt-20">
          {/* Explore Full Catagory Section */}
          <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8">
            
            <div className="flex flex-row gap-7 text-white lg:mt-8">
              {/* creating buttons using button component */}
              <CTAButton active={true} linkto={"/signup"}>
                <div className="flex items-center gap-2">
                  Explore Full Catalog
                  <FaArrowRight />
                </div>
              </CTAButton>

              <CTAButton active={false} linkto={"/login"}>
                Learn More
              </CTAButton>
            </div>

          </div>
        </div>

        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 ">

          {/* Job that is in Demand - Section 1 */}
          <div className="mb-10 lg:mt-20 flex flex-col justify-between gap-7 lg:flex-row lg:gap-0">

            <div className="text-4xl font-semibold lg:w-[45%] ">
              Get the skills you need for a{" "}
              <HighlightText text={"job that is in demand."} />
            </div>

            <div className="flex flex-col items-start gap-10 lg:w-[40%]">
              <div className="text-[16px]">
                The modern StudyNotion is the dictates its own terms. Today, to
                be a competitive specialist requires more than professional
                skills.
              </div>

              <CTAButton active={true} linkto={"/signup"}>
                <div className="">Learn More</div>
              </CTAButton>
            </div>

          </div>
        </div>

        {/* Timeline Section - Section 2 */}
        <TimelineSection />

        {/* Learning Language Section - Section 3 */}
        <LearningLanguageSection />

      </div>

      {/*Section 3 */}
      <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
        {/* Become a instructor section */}
        <InstructorSection />

        {/* Reviws from Other Learner */}
        <h1 className="text-center text-4xl font-semibold mt-8">
          Reviews from other learners
        </h1>
        {/* <ReviewSlider /> */}
      </div>

      {/* Footer */}
      <Footer />

    </div>
  )
}

export default Home