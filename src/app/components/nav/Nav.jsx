import React from "react";
import Image from "next/image";
import homeIcon from "../../../../public/assets/icons/home.svg";
import folderIcon from "../../../../public/assets/icons/folder.svg";
import dashIcon from "../../../../public/assets/icons/dash.svg";
import Link from "next/link";

function Nav() {
  return (
    <div className="flex items-center justify-center">
      <ul className="flex flex-row gap-5">
        <Link href={"/"}>
        {/* home redirect will change we use index as default */}
        <li className="flex flex-row items-center justify-center">
          <Image src={homeIcon} alt="home page" className="w-6 mx-2" />
          <span className="hidden sm:block">Home</span>
        </li>
        </Link>
        <Link href={"/assignments"}>
        <li className="flex flex-row items-center justify-center">
          <Image src={folderIcon} alt="assignment" className="w-6 mx-2" /> 
          <span className="hidden sm:block">Assignment</span>
        </li>
        </Link>
        <Link href="/dashboard">
        <li className="flex flex-row items-center justify-center">
          <Image src={dashIcon} alt="dashboard page" className="w-6 mx-2" /> 
          <span className="hidden sm:block">Dashboard</span>
        </li>
        </Link>
      </ul>
    </div>
  );
}

export default Nav;
