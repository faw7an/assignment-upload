"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Nav from "../components/nav/Nav";
import Profile from "../components/profile/Profile";
import AssignmentCard from "../components/assignmentCard/AssignmentCard";
import Modal from "../components/modal/Modal";
import CreateAssignment from "../components/createAssignment/CreateAssignment";
import addIcon from "../../../public/assets/icons/plus-solid (1).svg";
import Loading from "../components/loading/Loading";
import axios from "axios";
import SearchBar from "../components/searchBar/SearchBar";

export default function AssignmentListPage() {
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

  const handleAssignmentCreated = (newAssignment) => {
    // Add the new assignment to the deployed list
    setDeployed(prev => [newAssignment, ...prev]);
    // Close the modal
    setIsModalOpen(false);
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
        <SearchBar />
        {loading ? (
          <Loading />
        ) : deployed.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {deployed.map((assignment) => (
              <AssignmentCard
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
        <div className="relative mt-6 ">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
            onClick={handleModalToggle}
          >
          Add Assignment
          </button>
        </div>

        {/* Modal for creating new assignment */}
        <Modal isOpen={isModalOpen} onClose={handleModalToggle}>
          <CreateAssignment
            isOpen={isModalOpen}
            onClose={handleModalToggle}
            token={token}
            unitId={unitId}
            onAssignmentCreated={handleAssignmentCreated}
          />
        </Modal>
      </main>
    </div>
  );
}