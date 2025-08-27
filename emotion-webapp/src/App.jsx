import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import EmotionInput from './EmotionInput';
import ThankYouPage from './ThankYouPage';
import { ArrowLeftCircle } from 'lucide-react';
import DriftEmotionPage from './DriftEmotionPage'; // Import the new component
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import UserData from './UserData';

// UUID Generator 
const initUserID = () => {
  if (!sessionStorage.getItem('userID')) {
    sessionStorage.setItem('userID', uuidv4());
  }
};

// Tailwind-styled Card component
const Card = ({ children, className }) => (
  <div className={`bg-[#BFDDF5] rounded-3xl shadow-3xl p-10 ${className}`}>{children}</div>
);

const CardContent = ({ children }) => <div>{children}</div>;

// Tailwind-styled Button component
const Button = ({ children, className, ...props }) => (
  <button
    className={`bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

const HomePage = () => {
  useEffect(() => {
    // Generate and store a new userID each time the homepage is visited
    if (!sessionStorage.getItem('userID')) {
    const newUserID = uuidv4();
    sessionStorage.setItem('userID', newUserID);
    console.log('New session userID:', newUserID); // Optional: for debugging
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#94BAD9] p-6">
      <Card className="w-full max-w-3xl mx-auto rounded-xl shadow-xl overflow-hidden">
        <CardContent className="p-10">
          <h1 className="text-3xl font-bold mb-6 text-center">Welcome to the Emotion Study</h1>
          <p className="text-lg text-gray-700 mb-6">
            This web application collects data on emotional responses to different stimuli. We will ask you to report your current emotions using an Arousal-Valence graph and show you videos based on your inputs. Your responses will help us understand emotional dynamics better.
          </p>
          <p className="text-md text-gray-600 mb-8">
            All collected data will be anonymized and used solely for research purposes.
          </p>
          <div className="flex justify-center">
            <Link to="/user-data">
              <Button className="text-lg px-8 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const handleRestart = () => {
  window.location.href = '/';
};

const ReportEmotionPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#94BAD9] p-6">
      <Card className="w-full max-w-3xl mx-auto rounded-xl shadow-xl overflow-hidden">
        <CardContent className="p-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Report Your Emotion</h1>
            <button 
              onClick={handleRestart} 
              className="text-gray-500 hover:text-blue-600 bg-transparent p-2 rounded-full" 
              title="Restart test"
            >
              <ArrowLeftCircle size={28} />
            </button>
          </div>
          <p className="text-lg text-gray-700 mb-6 text-center">
            Please use the graph below to indicate your current emotional state.
          </p>
          <EmotionInput />
        </CardContent>
      </Card>
    </div>
  );
};

const App = () => {
  React.useEffect(() => {
    initUserID();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/user-data" element={<UserData />} />
        <Route path="/report-emotion" element={<ReportEmotionPage />} />
        <Route path="/drift-emotion" element={<DriftEmotionPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </Router>
  );
};

export default App;
