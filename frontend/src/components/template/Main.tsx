import React from "react"
import Header from "./Header"
import './Main.css'

export default (props: any) => <React.Fragment>
<Header {...props} />
<main>
   <div className="">
        {props.children}
   </div>
</main>
</React.Fragment>;