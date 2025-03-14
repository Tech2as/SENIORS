import React from "react"
import './Logo.css'
// @ts-expect-error TS(2307): Cannot find module '../../assets/imgs/logoa.png' o... Remove this comment to see the full error message
import logo from "../../assets/imgs/logoa.png"

export default (props: any) => <aside className="logo">
      <img src={logo} alt="logo"/>
</aside>;