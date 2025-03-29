"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Nav from "../components/nav/Nav";
import Profile from "../components/profile/Profile";
import Course from "../components/courseCard/CourseCard";
import Loading from "../components/loading/Loading";
export default function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  

  useEffect(() => {
    const storeToken = localStorage.getItem("authToken");
    setToken(storeToken);
  
    // Fetch courses using Axios
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
            "/api/dashboard/courses/",
            {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        ); 
        console.log(response.data);
        setCourses(response.data.courses); // Assuming the API returns { courses: [...] }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <Profile />
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Nav />
      </header>
      <main className="flex-grow p-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Course
              key={course.id}
              courseId={course.id}
              courseTitle={course.name}
              description={course.description}
            />
          ))
        ) : (
          <p className="text-gray-600">No courses available.</p>
        )}
      </main>
      <footer className="bg-gray-200 text-center py-4">
        <p className="text-gray-600">© 2025 Courses. All rights reserved.</p>
      </footer>
    </div>
  );
}