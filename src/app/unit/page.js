"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Nav from "../components/nav/Nav";
import Profile from "../components/profile/Profile";
import DeployedAssignment from "../components/deployedAssign/DeployedAssignment";
import Modal from "../components/modal/Modal";
import CreateAssignment from "../components/createAssignment/CreateAssignment";
import addIcon from "../../../public/assets/icons/plus-solid (1).svg"; // Replace with the actual path to your icon
import Loading from "../components/loading/Loading";
import axios from "axios";

export default function UnitPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deployed, setDeployed] = useState([]);

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev); // Toggle the modal's visibility
  };

  useEffect(() => {
    const storeToken = localStorage.getItem("authToken");
    setToken(storeToken);

    // Fetching deployed assignment
    const fetchDeployedAssignment = async () => {
      try {
        const response = await axios.get("/api/dashboard/assignments/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storeToken}`,
          },
        });
        console.log(response.data.assignments);
        setDeployed(response.data.assignments);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    if (storeToken) {
      fetchDeployedAssignment();
    } else {
      console.error("No token found in localStorage");
      setLoading(false); // Stop loading if no token is found
    }
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Profile />
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold mb-4">
          Assignments for Unit - {deployed[0]?.unit?.code || "N/A"}
        </h1>
        <Nav />
      </header>
      <main className="flex-grow p-6">
        {/* Map on deployed assignments */}
        {deployed.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {deployed.map((assignment) => (
              <DeployedAssignment
                key={assignment.id}
                unit={assignment.unit?.code}
                description={assignment.description}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No Deployed assignments available.</p>
        )}

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