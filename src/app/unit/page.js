"use client";
import { useState,useEffect } from "react";
import Image from "next/image";
import Nav from "../components/nav/Nav";
import Profile from "../components/profile/Profile";
import DeployedAssignment from "../components/deployedAssign/DeployedAssignment";
import Modal from "../components/modal/Modal";
import CreateAssignment from "../components/createAssignment/CreateAssignment";
import addIcon from "../../../public/assets/icons/plus-solid (1).svg"; // Replace with the actual path to your icon

export default function UnitPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev); // Toggle the modal's visibility
  };

  const [token ,setToken]=useState(null);
  
    useEffect(()=>{
      const storeToken = localStorage.getItem("authToken");
      setToken(storeToken);
  
    },[]);
    
  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <Profile />
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold mb-4">Assignments for Unit -unit-code</h1>
        <Nav />
      </header>
      <main className="flex-grow p-6">
        <DeployedAssignment unit="COM-1200" description={"This is some content for Unit."} />
        {/* Add new task icon */}
        <div className="relative">
          <div
            className="flex items-center bg-red-500 text-white w-10 hover:w-32 transition-all duration-300 p-2 m-5 rounded-full overflow-hidden cursor-pointer"
            onClick={handleModalToggle} // Open the modal
          >
            <Image src={addIcon} alt="Add Icon" className="w-6 h-6" />
            <p className="ml-3 whitespace-nowrap opacity-100">Add Task</p>
          </div>
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={handleModalToggle}>
          <CreateAssignment
            isOpen={isModalOpen}
            onClose={handleModalToggle}
            token={token} // Pass the token from local storage
          />
        </Modal>
      </main>
    </div>
  );
}