"use client"
import { useState } from "react";
import Image from "next/image";
import Greetings from "../components/greetings/Greetings";
import Nav from "../components/nav/Nav";
import Profile from "../components/profile/Profile";
import UnitCard from "../components/unitCard/UnitCard"


export default function Dashboard() {


  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <Profile />
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Nav />
      </header>
      <main className="flex-grow p-6">
        <Greetings user="Fauzan" />
        <UnitCard unitId={"1"} unitCode={"COM1023"} unitTitle={"Computer Networking"} courseTitle={"Computer Science"} dueDate={"12-11-2025"}/>
        {/* Add new task icon */}
        {/* <div className="relative">
          <div
            className="flex items-center bg-red-500 text-white w-10 hover:w-32 transition-all duration-300 p-2 m-5 rounded-full overflow-hidden cursor-pointer"
            onClick={handleModalToggle} // Open the modal
          >
            <Image src={addIcon} alt="Add Icon" className="w-6 h-6" />
            <p className="ml-3 whitespace-nowrap opacity-100">Add Task</p>
          </div>
        </div> */}

        {/* Create Assignment Modal */}
        
      </main>
      <footer className="bg-gray-200 text-center py-4">
        <p className="text-gray-600">© 2025 Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
}