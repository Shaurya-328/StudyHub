// component for creating reusable buttons

import React from 'react'
import {Link} from "react-router-dom"

// input props are childeren,active,linkto
const Button = ({children, active, linkto}) => {
    // children is used to determine the text of the button
    // active is used to determine the color of the button
  return (
     <Link to={linkto}> 
     {/* link tab indicates the url which the button pointes to */}

        <div className={`text-center text-[13px] px-6 py-3 rounded-md font-bold
        ${active ? "bg-yellow-50 text-black":" bg-richblack-800"}
        hover:scale-95 transition-all duration-200
        `}>
            {children}
        </div>

    </Link>
  )
}

export default Button
