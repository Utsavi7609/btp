import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserData = () => {
  const navigate = useNavigate();
  
  // Initialize form values with empty values to prevent undefined errors
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    age: '',
    watchesEnglishMovies: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:5000/user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Optional: Store in sessionStorage
      sessionStorage.setItem('userData', JSON.stringify(formData));
  
      // Navigate to the next page
      navigate('/report-emotion');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to submit data. Please try again.');
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#94BAD9] p-4">
      <div className="bg-[#BFDDF5] rounded-3xl shadow-2xl w-full max-w-lg p-8 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Tell Us About Yourself</h1>
        <p className="text-md text-gray-700 text-center mb-6">
          Please fill in the information below. <br />
          <span className="text-blue-800 font-semibold">
            Your responses will be used for research purposes only and will remain confidential.
          </span>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Your name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min={1}
              max={120}
              className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Your age"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Do you watch English movies in general?
            </label>
            <select
              name="watchesEnglishMovies"
              value={formData.watchesEnglishMovies}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            >
              <option value="">Select an option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 mt-2 text-white font-semibold bg-blue-600 rounded-xl shadow-md hover:bg-blue-700 transition duration-200"
          >
            Continue
          </button>
        </form>
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          All information provided will be anonymized and used solely for academic research. Your privacy is our priority.
        </p>
      </div>
    </div>
  );
};

export default UserData;
