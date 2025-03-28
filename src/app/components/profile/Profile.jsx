"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import userDefault from "../../../../public/assets/icons/userDefault.svg";
import settingsIcon from "../../../../public/assets/icons/gear-solid.svg";
import logOutIcon from "../../../../public/assets/icons/right-from-bracket-solid.svg";
import fawzan from "../../../../public/assets/images/faw7y.jpg";

function Profile() {
  const [isVisible, setVisibility] = useState(false);
  const profileCardRef = useRef(null);
  const profileButtonRef = useRef(null);

  const handleVisiblity = (event) => {
    event.stopPropagation();
    setVisibility(!isVisible);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileCardRef.current &&
        !profileCardRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setVisibility(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="z-10">
      {/* Overlay */}
      {isVisible && (
  <div
    className="fixed top-0 left-0 w-full h-full bg-black/50 z-40"
    onClick={() => setVisibility(false)} // Close the profile card when clicking on the overlay
  ></div>
)}
      <div className="profile absolute top-22 w-10 h-8 right-2 z-50" ref={profileButtonRef} onClick={handleVisiblity}>
        <Image
          src={userDefault}
          alt="profile"
          className="w-6 h-6 sm:w-9 sm:h-9 absolute right-5 top-[-40] sm:top-[-45] sm:right-5 p-0.5 bg-white rounded-full "
        />
      </div>
      {/* Profile Card */}
      {/* <div
        className={`z-50 w-84 fixed right-5 top-20 text-black flex flex-col items-center justify-center rounded-lg bg-white shadow-lg p-6 ${
          isVisible ? "visible" : "hid"
        }`}
      > */}
      <div
        ref={profileCardRef}
        className={`z-50 w-84 fixed right-5 top-20 text-black flex flex-col items-center justify-center rounded-lg bg-white shadow-lg p-6 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* <Image
          src={userDefault}
          alt="profile"
          className="w-20 h-20 sm:w-24 sm:h-24 p-1 mb-4 bg-gray-200 rounded-full shadow-md"
        /> */}
        <Image
          src={fawzan}
          alt="profile"
          className="w-20 h-20 sm:w-24 sm:h-24 p-1 mb-4 bg-gray-200 object-cover rounded-full shadow-md"
          quality={100}
        />
        <h2 className="text-lg font-semibold mb-2">Fauzan Said</h2>
        <p className="text-gray-600 mb-1">
          <span className="font-semibold">Email:</span>{" "}
          <span className="font-medium">fauzdasoodais@gmail.com</span>
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">Course:</span>{" "}
          <span className="font-medium">Computer Science</span>
        </p>
        <div className="mt-30 flex flex-row gap-5">
          <button className="flex gap-2 rounded bg-green-500 hover:bg-green-600 transform transition hover:text-white text-white p-2">
            <Image src={settingsIcon} alt="settings" className="w-5 h-5 " />
            Update profile
          </button>
          <button className="flex gap-2 rounded bg-red-500 hover:bg-red-600 hover:text-white text-white p-2 px-4">
            Log out
            <Image src={logOutIcon} alt="log out" className="w-5 h-5 " />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
