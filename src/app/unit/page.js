"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Nav from "../components/nav/Nav";
import Profile from "../components/profile/Profile";
import DeployedAssignment from "../components/deployedAssign/DeployedAssignment";
import Modal from "../components/modal/Modal";
import CreateAssignment from "../components/createAssignment/CreateAssignment";
import addIcon from "../../../public/assets/icons/plus-solid (1).svg";
import Loading from "../components/loading/Loading";
import axios from "axios";

export default function UnitPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [deployed, setDeployed] = useState([]);
  const [unitDetails, setUnitDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const unitId = searchParams.get('unitId');

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleAssignmentDeleted = (deletedId) => {
    // Filter out the deleted assignment
    setDeployed(deployed.filter(assignment => assignment.id !== deletedId));
  };

  useEffect(() => {
    const storeToken = localStorage.getItem("authToken");
    setToken(storeToken);

    if (!unitId) {
      console.error("No unit ID provided");
      setLoading(false);
      return;
    }

    // Fetch unit details
    const fetchUnitDetails = async () => {
      try {
        const response = await axios.get(`/api/dashboard/units/${unitId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storeToken}`,
          },
        });
        setUnitDetails(response.data.unit);
      } catch (error) {
        console.error("Failed to fetch unit details:", error);
      }
    };

    // Fetch assignments for this specific unit
    const fetchUnitAssignments = async () => {
      try {
        const response = await axios.get(`/api/dashboard/assignments?unitId=${unitId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storeToken}`,
          },
        });
        console.log("Unit assignments:", response.data.assignments);
        setDeployed(response.data.assignments);
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (storeToken && unitId) {
      fetchUnitDetails();
      fetchUnitAssignments();
    } else {
      console.error("No token found in localStorage or missing unitId");
      setLoading(false);
    }
  }, [unitId]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Profile />
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold mb-4">
          Assignments for Unit - {unitDetails?.code || "Loading..."}
        </h1>
        <Nav />
      </header>
      <main className="flex-grow p-6">
        {loading ? (
          <Loading />
        ) : deployed.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {deployed.map((assignment) => (
              <DeployedAssignment
                key={assignment.id}
                id={assignment.id}
                unit={assignment.unit?.code}
                title={assignment.title}
                description={assignment.description}
                dueDate={assignment.dueDate}
                onAssignmentDeleted={handleAssignmentDeleted}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No assignments available for this unit.</p>
        )}

        {/* Add new assignment button */}
        <div className="relative">
          <div
            className="flex items-center bg-red-500 text-white w-10 hover:w-32 transition-all duration-300 p-2 m-5 rounded-full overflow-hidden cursor-pointer"
            onClick={handleModalToggle}
          >
            <Image src={addIcon} alt="Add Icon" className="w-6 h-6" />
            <p className="ml-3 whitespace-nowrap opacity-100">Add Assignment</p>
          </div>
        </div>

        {/* Modal for creating new assignment */}
        <Modal isOpen={isModalOpen} onClose={handleModalToggle}>
          <CreateAssignment
            isOpen={isModalOpen}
            onClose={handleModalToggle}
            token={token}
            unitId={unitId}
          />
        </Modal>
      </main>
    </div>
  );
}