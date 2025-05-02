"use client"
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
// Update Heroicons import to the newer version
// import { UserCircle as UserCircleIcon, 
//          HomeIcon, 
//          FolderIcon, 
//          ChartBarIcon } from '@heroicons/react/24/outline';
import Uploader from '../components/uploader/Uploader';
import Nav from '../components/nav/Nav';
import Profile from '../components/profile/Profile';


export default function AssignmentSubmission() {

  return (
    <div className="min-h-screen bg-gray-50">
      <Profile />
       <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Assignment Submission </h1>
        <Nav />
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold mb-10 text-blue-500">Submit Assignment</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Submission Form */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-2xl font-semibold text-blue-500 mb-4">{"Unit Name"}</h3>
                
                <form >
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="assignmentTitle" className="block text-sm font-medium text-gray-700">
                        Assignment Title
                      </label>
                      <input
                        type="text"
                        name="assignmentTitle"
                        id="assignmentTitle"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder='Title e.g COM222-1'
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description (Optional)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        className="mt-1 mb-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add any notes about your submission"
                      />
                    </div>

                    <Uploader />
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

              <div className="bg-white shadow rounded-lg p-6">
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

      <footer className="bg-gray-200 py-4 px-6 text-center text-gray-600 text-sm absolute bottom-0">
        © 2025 Student Monitor System
      </footer>
    </div>
  );
}