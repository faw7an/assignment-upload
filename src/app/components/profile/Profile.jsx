"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import userDefault from "../../../../public/assets/icons/userDefault.svg";
import settingsIcon from "../../../../public/assets/icons/gear-solid.svg";
import logOutIcon from "../../../../public/assets/icons/right-from-bracket-solid.svg";
import fawzan from "../../../../public/assets/images/faw7y.jpg";
import Avatar from "../avatar/Avatar";
import axios from "axios";


function Profile() {
  const [isVisible, setVisibility] = useState(false);
  const profileCardRef = useRef(null);
  const profileButtonRef = useRef(null);
  const [user, setUser] = useState({ username: "" });
  const [token, setToken] = useState(null);

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
        // Skip handling clicks outside if the card is already hidden
        if (!isVisible) return;
        setVisibility(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]); // Added isVisible to dependency array

  useEffect(() => {
    const storeToken = localStorage.getItem("authToken");
    setToken(storeToken);

    const fetchUserData = async () => {
      try {
        const response = await axios.get("api/user/profile", {
          headers: {
            Authorization: `Bearer ${storeToken}`,
          },
        });
        setUser(response.data.user);
        console.log(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    if(storeToken){
      fetchUserData();
    }
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

      <div
        className="profile absolute top-18 sm:top-20 md:top-20 lg:top-19 w-full h-[500px] right-2 z-50"
        ref={profileButtonRef}
        onClick={handleVisiblity}
      >
        <Avatar name={user.username || ''}  />
      </div>

      {/* Profile Card */}
      <div
        ref={profileCardRef}
        className={`z-50 w-84 fixed right-5 top-20 text-black flex flex-col items-center justify-center rounded-lg bg-white shadow-lg p-6 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Image
          src={fawzan}
          alt="profile"
          className="w-20 h-20 sm:w-24 sm:h-24 p-1 mb-4 bg-gray-200 object-cover rounded-full shadow-md"
          quality={100}
        />
        <h2 className="text-lg font-semibold mb-2">{user.username}</h2>
        <p className="text-gray-600 mb-1">
          <span className="font-semibold">Email:</span>{" "}
          <span className="font-medium">{user.email}</span>
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">Course:</span>{" "}
          <span className="font-medium">Computer Science</span>
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-semibold">Role:</span>{" "}
          <span className="font-medium">{user.role}</span>
        </p>
        <div className="mt-30 flex flex-row gap-5">
          <button className="flex gap-2 rounded bg-green-500 hover:bg-green-600 transform transition hover:text-white text-white p-2">
            <Image src={settingsIcon} alt="settings" className="w-5 h-5 " />
            Update profile
          </button>
          <button
            className="flex gap-2 rounded bg-red-500 hover:bg-red-600 hover:text-white text-white p-2 px-4"
            onClick={() => {
              localStorage.clear(); // Clear local storage
              // refresh window
              window.location.reload();
            }}
          >
            Log out
            <Image src={logOutIcon} alt="log out" className="w-5 h-5 " />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
