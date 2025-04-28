"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Profile from "../components/profile/Profile";
import Nav from "../components/nav/Nav";
import DoughnutChart from "../components/chart/Chart";

function monitor() {
  // Sample data - replace with actual API data in production
  const [chartData, setChartData] = useState({
    labels: ["Submitted", "Pending"],
    datasets: [
      {
        label: "Assignment Status",
        data: [65, 15],
        backgroundColor: [
          "#3b82f6", // blue
          "#f59e0b", // amber
        ],
        borderColor: ["#3b82f6", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  });

  const [students, setStudents] = useState([
    {
      id: 1,
      name: "John Smith",
      initials: "JS",
      status: "Submitted",
      statusColor: "#3b82f6",
    },
    {
      id: 2,
      name: "Amy Johnson",
      initials: "AJ",
      status: "Pending",
      statusColor: "#10b981",
    },
    {
      id: 3,
      name: "Tom Wilson",
      initials: "TW",
      status: "Pending",
      statusColor: "#f59e0b",
    },
    {
      id: 4,
      name: "Sarah Lee",
      initials: "SL",
      status: "Submitted",
      statusColor: "#3b82f6",
    },
    {
      id: 5,
      name: "Ryan Jones",
      initials: "RJ",
      status: "Pending",
      statusColor: "#f59e0b",
    },
  ]);

  const [stats, setStats] = useState({
    totalStudents: 35,
    totalSubmissions: 12,
    averageSubmission: 87,
    dueToday: "02-11-2021",
  });

  // Uncomment and modify to fetch actual data
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get('/api/assignment-stats');
  //       setChartData({
  //         labels: ['Submitted', 'Graded', 'Pending'],
  //         datasets: [{
  //           label: 'Assignment Status',
  //           data: [
  //             response.data.submitted,
  //             response.data.graded,
  //             response.data.pending
  //           ],
  //           backgroundColor: [
  //             '#3b82f6',
  //             '#10b981',
  //             '#f59e0b',
  //           ],
  //           borderColor: [
  //             '#3b82f6',
  //             '#10b981',
  //             '#f59e0b',
  //           ],
  //           borderWidth: 1,
  //         }],
  //       });
  //       setStudents(response.data.recentSubmissions);
  //       setStats(response.data.stats);
  //     } catch (error) {
  //       console.error("Error fetching assignment data:", error);
  //     }
  //   };
  //
  //   fetchData();
  // }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <Profile />
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Monitor</h1>
        <Nav />
      </header>
      <main className="flex-grow p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-blue-500  mb-4">
                Assignment Submission Status
              </h2>
              <div className="flex justify-center items-center h-64 relative">
                <DoughnutChart chartData={chartData} />
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  {/* completion percentage */}
                  <span className="text-2xl text-gray-600 font-bold">85%</span>
                  <span className="text-sm text-gray-500">Completed</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 justify-center">
                <div className="flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Submitted (65%)</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Pending (15%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Student List Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recent Submissions
              </h2>
              <ul className="space-y-4">
                {students.map((student) => (
                  <li
                    key={student.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: student.statusColor }}
                      >
                        {student.initials}
                      </div>
                      <span className="ml-3 text-gray-800">{student.name}</span>
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: student.statusColor }}
                    >
                      {student.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Students
            </h3>
            <p className="text-3xl font-bold text-blue-500 mt-2">
              {stats.totalStudents}
            </p>
            <p className="text-sm text-gray-500 mt-1">In this class</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Submissions</h3>
            <p className="text-3xl font-bold text-green-500 mt-2">
              {stats.totalSubmissions}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Submissions</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Avg. Score</h3>
            <p className="text-3xl font-bold text-amber-500 mt-2">
              {stats.averageSubmission}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Class average</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Due Date</h3>
            <p className="text-3xl font-bold text-red-500 mt-2">
              {stats.dueToday}
            </p>
            <p className="text-sm text-gray-500 mt-1">Assignments</p>
          </div>
        </div>
      </main>
      <footer className="bg-gray-200 py-4 px-6 text-center text-gray-600 text-sm">
        © 2025 Student Monitor System
      </footer>
    </div>
  );
}

export default monitor;
