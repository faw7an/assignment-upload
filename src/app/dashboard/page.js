"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Nav from "../components/nav/Nav";
import Profile from "../components/profile/Profile";
import Course from "../components/courseCard/CourseCard";
import Greetings from "../components/greetings/Greetings";
import CreateCourse from "../components/createCourse/CreateCourse";


export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState(null);

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleCourseCreated = (course) => {
    setNewCourse(course);
  };

  const handleCourseDeleted = (courseId) => {
    setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
  };

  useEffect(() => {
    const storeToken = localStorage.getItem("authToken");
    setToken(storeToken);

    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/dashboard/courses/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storeToken}`,
          },
        });
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!isModalOpen && newCourse) {
      setCourses((prevCourses) => [newCourse, ...prevCourses]);
      setNewCourse(null);
    }
  }, [isModalOpen, newCourse]);

  

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <Profile />
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Nav />
      </header>
      <main className="flex-grow p-6">
        <Greetings user="Fauzan" />
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <Course
                key={course.id}
                courseId={course.id}
                courseCode={course.code}
                courseTitle={course.name}
                description={course.description}
                onCourseDeleted={handleCourseDeleted} // Pass the callback
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No courses available.</p>
        )}

        {/* Add new course button */}
        <div className="relative">
          <div
            className="flex items-center bg-green-500 text-white w-32 p-2 m-5 rounded cursor-pointer"
            onClick={handleModalToggle}
          >
            <p className="ml-3 whitespace-nowrap opacity-100">Add Course</p>
          </div>
        </div>

        {/* Modal */}
        <CreateCourse
          isOpen={isModalOpen}
          onClose={handleModalToggle}
          token={token}
          onCourseCreated={handleCourseCreated}
        />
      </main>
      <footer className="bg-gray-200 text-center py-4">
        <p className="text-gray-600">© 2025 Courses. All rights reserved.</p>
      </footer>
    </div>
  );
}