"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === 'email' ? 'identifier' : id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.identifier || !formData.password) {
      setError('All fields are required');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token in localStorage for client-side API calls
      localStorage.setItem('authToken', data.token);
      
      // Also store token in a cookie for server-side authentication
      document.cookie = `authToken=${data.token}; path=/; max-age=${60*60*200}; SameSite=Strict`;
      
      // Store user courses in localStorage if available
      if (data.courses && Array.isArray(data.courses)) {
        localStorage.setItem('userCourses', JSON.stringify(data.courses));
      }
      
      setSuccess('Login successful!');
      
      // Clear form after successful login
      setFormData({
        identifier: '',
        password: '',
      });
      
      // Redirect based on user role
      setTimeout(() => {
        if (data.userRole === "SUPER_ADMIN") {
          router.push('/dashboard');
        } else if (data.courses && data.courses.length > 0) {
          router.push(`/unitList?courseId=${data.courses[0].id}`);
        } else {
          router.push('/unitList');
        }
      }, 50);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f6f9fc] to-[#edf2f7] p-5">
      <div className="w-full max-w-md md:max-w-lg bg-white p-6 sm:p-8 rounded-3xl shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">Log In</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
              Email or Username
            </label>
            <input
              type="text"
              id="email"
              value={formData.identifier}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-600"
              placeholder="Enter your email or username"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-600"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition hover:-translate-y-0.5 shadow-sm hover:shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}