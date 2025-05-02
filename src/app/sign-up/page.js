"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignUp() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(null);
  const [token, setToken] = useState(null);
  const [courseID, setId] = useState(null);

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (
          !formData.username ||
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword
        ) {
          setError("All fields are required");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        setError("");
        return true;

      case 1:
        if (!formData.course) {
          setError("Please select a course");
          return false;
        }
        setError("");
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCourseSelection = (courseID) => {
    setId(courseID); // Fix the parameter name to match

    setFormData((prev) => ({
      ...prev,
      course: courseID,
    }));
    console.log(courseID);
    console.log(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      try {
        setIsLoading(true);
        setError("");

        const response = await axios.post("/api/auth/register", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        // With axios, the response data is already parsed in response.data
        const data = response.data;

        setSuccess(data.message || "Registration successful!");

        // Store token in localStorage
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Registration failed"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchCourses = async () => {
    try {
      setLoadingCourse(true);
      const storeToken = localStorage.getItem("authToken");
      const response = await axios.get("/api/dashboard/courses", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storeToken}`,
        },
      });

      setCourses(response.data.courses);
      setToken(storeToken);
    } catch (err) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoadingCourse(false);
    }
  };

  const enrollCourse = async () => {
    try {
      setIsLoading(true); // Set loading state to true while enrolling
      
      const response = await axios.post(
        "/api/dashboard/courses/enroll",
        {
          courseId: courseID,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Handle successful enrollment
      setSuccess(response.data.message || "Successfully enrolled in course");
      
      // Redirect user to unitList page with courseId as query parameter
      setTimeout(() => {
        router.push(`/log-in`);
      }, 1000);
      
      return response.data;
    } catch (err) {
      // More comprehensive error handling
      setError(
        err.response?.data?.message || err.message || "Failed to enroll in course"
      );
      return null;
    } finally {
      setIsLoading(false); // Reset loading state regardless of outcome
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f6f9fc] to-[#edf2f7] p-5">
      <div className="w-full max-w-2xl mx-auto bg-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-lg">
        {/* Progress Bar */}
        <div className="relative flex justify-between px-5 sm:px-10 mb-8 sm:mb-10">
          <div className="absolute h-0.5 bg-gray-200 top-1/2 left-5 sm:left-10 right-5 sm:right-10 -translate-y-1/2 z-0"></div>
          {[1, 2].map((step, index) => (
            <div
              key={step}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full z-10 font-semibold transition-all
                ${
                  index < currentStep
                    ? "bg-indigo-500 text-white border-2 border-indigo-500"
                    : index === currentStep
                    ? "bg-indigo-500 text-white border-2 border-indigo-500"
                    : "bg-white border-2 border-gray-200 text-gray-700"
                }`}
            >
              {step}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded animate-fadeIn">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded animate-fadeIn">
            {success}
          </div>
        )}

        <form>
          {/* Step 1: Account Information */}
          {currentStep === 0 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
                Create Your Account
              </h2>
              <div className="mb-5">
                <label
                  htmlFor="username"
                  className="block text-gray-600 font-medium mb-2 text-sm"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-gray-600"
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block text-gray-600 font-medium mb-2 text-sm"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-gray-600"
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="password"
                  className="block text-gray-600 font-medium mb-2 text-sm"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-gray-600"
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-600 font-medium mb-2 text-sm"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-gray-600"
                />
              </div>
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={(e) => {
                    handleSubmit(e);
                    fetchCourses();
                    handleNext();
                  }}
                  className="px-5 py-3 sm:px-7 sm:py-3.5 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 hover:-translate-y-0.5 transition shadow-sm hover:shadow-md"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Course Selection */}
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
                Select Your Course
              </h2>

              {loadingCourse ? (
                <p className="text-gray-600">Loading courses...</p>
              ) : courses && courses.length > 0 ? (
                courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleCourseSelection(course.id)}
                    className={`border-2 p-4 sm:p-5 rounded-2xl mb-4 cursor-pointer transition bg-gray-50 hover:bg-white
                      ${
                        formData.course === course.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200"
                      }`}
                  >
                    <h1 className="text-lg sm:text-xl font-semibold text-blue-500 ">
                      {course.code}
                    </h1>
                    <h3 className="text-lg sm:text-xl font-semibold text-blue-700 ">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      {course.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No courses available. Please contact an administrator.</p>
              )}

              <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-3 sm:px-7 sm:py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 hover:-translate-y-0.5 transition order-2 sm:order-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  onClick={enrollCourse}
                  className={`px-5 py-3 sm:px-7 sm:py-3.5 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 hover:-translate-y-0.5 transition shadow-sm hover:shadow-md order-1 sm:order-2 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Signing Up..." : "Complete Registration"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
