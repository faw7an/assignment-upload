"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Uploader from '../components/uploader/Uploader';
import Nav from '../components/nav/Nav';
import Profile from '../components/profile/Profile';
import axios from 'axios';

export default function AssignmentSubmission() {
  const [token, setToken] = useState(null);
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('id');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get token on component mount
    const storeToken = localStorage.getItem("authToken");
    setToken(storeToken);
  }, []);

  const handleFileChange = (selectedFile) => {
    console.log("File selected:", selectedFile);
    setFile(selectedFile);
    setError(null); // Clear any previous errors
  };

  const handleSubmission = async (e) => {
    if (e) e.preventDefault();
    
    // Validate inputs
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    
    if (!assignmentId) {
      setError("Missing assignment ID");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const storeToken = localStorage.getItem("authToken");
      
      if (!storeToken) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignmentId', assignmentId);
      
      // Log what's being sent
      console.log("Submitting file:", file);
      console.log("Assignment ID:", assignmentId);
      
      const response = await axios.post(
        "/api/dashboard/assignments/submissions",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${storeToken}`
          }
        }
      );
      
      // Handle successful submission
      console.log("Submission response:", response.data);
      alert("Assignment submitted successfully!");
      setFile(null); // Reset file state
      
    } catch (error) {
      console.error("Submission failed:", error);
      
      // More detailed error handling
      if (error.response) {        
        // console.error("Error data:", error.response.data);
        // console.error("Error status:", error.response.status);
        setError(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setError("No response from server. Please check your connection and try again.");
      } else {
        // Something happened in setting up the request that triggered an Error
        // console.error("Error message:", error.message);
        setError(`Error: ${error.message}`);
      }
      
      alert("Failed to submit assignment. " + (error.response?.data?.message || error.message || "Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Use a flex column container that takes up at least the full viewport height
    <div className="flex flex-col min-h-screen">
      {/* Main content with flex-grow to push footer down */}
      <div className="flex-grow bg-gray-50">
        <Profile />
        <header className="bg-blue-500 text-white py-4 px-6">
          <h1 className="text-2xl font-bold">Assignment Submission</h1>
          <Nav />
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h2 className="text-3xl font-semibold mb-10 text-blue-500">Submit Assignment</h2>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Submission Form */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-2xl font-semibold text-blue-500 mb-4">{"Unit Name"}</h3>
                  
                  <form onSubmit={handleSubmission}>
                    <div className="space-y-6">
                      <Uploader 
                        onFileChange={handleFileChange}
                        onSubmit={handleSubmission}
                      />
                      {submitting && (
                        <div className="text-center">
                          <p className="text-blue-500">Submitting assignment...</p>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Side Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Assignment Details</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                      <p className="text-base text-red-500 font-bold">02-11-2025</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Time Remaining</h4>
                      <p className="text-base text-gray-700">3 days, 14 hours</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Max Score</h4>
                      <p className="text-base text-gray-700">100 points</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">File Types</h4>
                      <p className="text-base text-gray-700">PDF, DOC, DOCX, PPT, ZIP</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow mt-10 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Submission Guidelines</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>All submissions must include your student ID</li>
                    <li>File size limit is 10MB</li>
                    <li>Late submissions will receive a 10% penalty per day</li>
                    <li>Include all references in APA format</li>
                    <li>For technical issues, contact IT support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <footer className="bg-gray-200 py-4 px-6 text-center text-gray-600 text-sm">
        © 2025 Student Monitor System
      </footer>
    </div>
  );
}