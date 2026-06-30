import React, { useState } from "react";
import { HomePageExplore } from "../../../data/homepage-explore";
import CourseCard from "./CourseCard";
import HighlightText from "./HighlightText";

// Tabs displayed on the Explore More section
const tabsName = [
  "Free",
  "New to coding",
  "Most popular",
  "Skills paths",
  "Career paths",
];

// Course data is stored separately in the data folder

const ExploreMore = () => {

  // React state is used because the UI changes when the user clicks on different tabs/cards.

  // By default, the "Free" tab is selected.
  const [currentTab, setCurrentTab] = useState(tabsName[0]);

  // Stores the courses corresponding to the currently selected tab.
  const [courses, setCourses] = useState(HomePageExplore[0].courses);

  // Stores the currently active/highlighted course card.
  const [currentCard, setCurrentCard] = useState(
    HomePageExplore[0].courses[0].heading
  );


  // Function called whenever a tab is clicked.
  const setMyCards = (value) => {

    // Update the active tab.
    setCurrentTab(value);

    // Find the object whose tag matches the selected tab.
    const result = HomePageExplore.filter((course) => course.tag === value);

    // Update the courses displayed on the screen.
    setCourses(result[0].courses);

    // Make the first course card active by default.
    setCurrentCard(result[0].courses[0].heading);
  };

  // designing the cards
  return (
    <div>

      {/* Explore More Heading */}
      <div>
        <div className="text-4xl font-semibold text-center my-10">
          Unlock the
          <HighlightText text={"Power of Code"} />

          {/* Subtitle */}
          <p className="text-center text-richblack-300 text-lg font-semibold mt-1">
            Learn to Build Anything You Can Imagine
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="hidden lg:flex gap-5 -mt-5 mx-auto w-max bg-richblack-800 text-richblack-200 p-1 rounded-full font-medium drop-shadow-[0_1.5px_rgba(255,255,255,0.25)]">

        {/* Loop through all tabs and render them */}
        {tabsName.map((ele, index) => {
          return (
            <div
              key={index}

              // Highlight the currently selected tab.
              className={`text-[16px] flex flex-row items-center gap-2 ${
                currentTab === ele
                  ? "bg-richblack-900 text-richblack-5 font-medium"
                  : "text-richblack-200"
              } px-7 py-[7px] rounded-full transition-all duration-200 cursor-pointer hover:bg-richblack-900 hover:text-richblack-5`}

              // Change courses when a tab is clicked.
              onClick={() => setMyCards(ele)}
            >
              {ele}
            </div>
          );
        })}
      </div>

      {/* Spacer used to create space for the floating cards */}
      <div className="hidden lg:block lg:h-[200px]"></div>

      {/* Cards Section */}
      <div className="absolute gap-10 justify-center lg:gap-0 flex lg:justify-between flex-wrap w-full lg:bottom-[0] lg:left-[50%] lg:translate-x-[-50%] lg:translate-y-[50%] text-black lg:mb-0 mb-7 lg:px-0 px-3">

        {/* Render all course cards for the selected tab */}
        {courses.map((ele, index) => {
          return (
            <CourseCard
              key={index}
              cardData={ele}
              currentCard={currentCard}
              setCurrentCard={setCurrentCard}
            />
          );
        })}
      </div>

    </div>
  );
};

export default ExploreMore;