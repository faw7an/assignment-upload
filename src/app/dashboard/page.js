"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Greetings from "../components/greetings/Greetings";
import Nav from "../components/nav/Nav";
import Profile from "../components/profile/Profile";
import UnitCard from "../components/unitCard/UnitCard";
import CreateUnit from "../components/createUnit/CreateUnit";

export default function Dashboard() {
  const router = useRouter();
  const [isCreateUnitOpen, setIsCreateUnitOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        
        if (!storedToken) {
          // No token found, redirect to login
          router.push('/log-in');
          return;
        }
        
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/log-in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]

  // const storedToken = localStorage.getItem("authToken");
  //   const storeToken = localStorage.getItem("authToken");
  //   setToken(storeToken);
  // }
);

  const handleOpenCreateUnit = () => setIsCreateUnitOpen(true);
  const handleCloseCreateUnit = () => setIsCreateUnitOpen(false);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only render dashboard if authenticated
  if (!isAuthenticated) {
    return null; // This prevents flash of content before redirect completes
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <Profile />
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Nav />
      </header>
      <main className="flex-grow p-6">
        <Greetings user="Fauzan" />
        <UnitCard
          unitId={"1"}
          unitCode={"COM1023"}
          unitTitle={"Computer Networking"}
          courseTitle={"Computer Science"}
          dueDate={"12-11-2025"}
        />
        {/* Add Unit Button */}
        <div className="mt-6">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
            onClick={handleOpenCreateUnit}
          >
            Add Unit
          </button>
        </div>
      </main>
      <footer className="bg-gray-200 text-center py-4">
        <p className="text-gray-600">© 2025 Dashboard. All rights reserved.</p>
      </footer>

      {/* Create Unit Modal */}
      <CreateUnit
        isOpen={isCreateUnitOpen}
        onClose={handleCloseCreateUnit}
        token={token} // Pass the token fetched from local storage
      />
    </div>
  );
}