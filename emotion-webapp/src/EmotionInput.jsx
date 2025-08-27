import React, { useState } from 'react';
import { ArrowLeftCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const EmotionInput = () => {
  const [responses, setResponses] = useState({
    // emotion: 'Neutral', // COMMENT: no need for emotion anymore
    // intensity: 3, // COMMENT: no need for intensity anymore
    valence: 3,
    arousal: 3
  });

  const [videoUrl, setVideoUrl] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const userID = sessionStorage.getItem('userID');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses({ ...responses, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const currentTime = new Date().toISOString(); // Capture current timestamp
  
      const requestData = {
        ...responses,
        timestamp: currentTime,
        submittype: 'emotion-input',
        userID: userID // Include userID in the payload
      };
  
      const res = await fetch('http://localhost:5000/api/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
  
      if (res.ok) {
        const videoBlob = await res.blob();
        const videoObjectUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(videoObjectUrl);
        setIsSubmitted(true);
      } else {
        console.error('Failed to fetch video');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  const handleRestart = () => {
    window.location.reload();
  };

  const handleProceed = () => {
    navigate('/drift-emotion'); // Navigate to /drift-emotion
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4">Report your emotion</h2>
      </div>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset disabled={isSubmitted}>

          {/* COMMENTED: emotion input */}
          {/*
          <div>
            <p className="font-semibold mb-2"> What was your emotion at first part? </p>
            <div className="flex space-x-4">
              {['Anger', 'Fear', 'Neutral', 'Happiness', 'Sadness', 'Other'].map((emotion) => (
                <label key={emotion} className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="emotion"
                    value={emotion}
                    checked={responses.emotion === emotion}
                    onChange={handleChange}
                  />
                  <span>{emotion}</span>
                </label>
              ))}
            </div>
          </div>
          */}

          {/* COMMENTED: intensity input */}
          {/*
          <div>
            <p className="font-semibold mb-2">How was the intensity of the emotion you felt?</p>
            <div className="flex flex-col space-y-2">
              <input
                type="range"
                name="intensity"
                min="1"
                max="5"
                value={responses.intensity}
                onChange={handleChange}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-sm text-gray-600">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num}>{num}</span>
                ))}
              </div>
            </div>
          </div>
          */}

          {/* KEEP: valence input */}
          <div>
            <p className="font-semibold mb-2">Are you feeling Negative or Positive (Valence level)?</p>
            <div className="flex flex-col space-y-2">
              <input
                type="range"
                name="valence"
                min="1"
                max="5"
                value={responses.valence}
                onChange={handleChange}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-sm text-gray-600">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num}>{num}</span>
                ))}
              </div>
            </div>
          </div>

          {/* KEEP: arousal input */}
          <div>
            <p className="font-semibold mb-2">Are you feeling calm or excited (Arousal level)?</p>
            <div className="flex flex-col space-y-2">
              <input
                type="range"
                name="arousal"
                min="1"
                max="5"
                value={responses.arousal}
                onChange={handleChange}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-sm text-gray-600">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num}>{num}</span>
                ))}
              </div>
            </div>
          </div>

          <div className='flex justify-center'>
            <button
              type="button"
              className={`bg-blue-600 text-white px-6 py-3 rounded-xl transition duration-300 shadow-md transform ${isSubmitted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-lg hover:scale-105'}`}
              onClick={handleSubmit}
              disabled={isSubmitted}
            >
              Submit
            </button>
          </div>
        </fieldset>
      </form>

      {videoUrl && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Your Video</h3>
          <video controls className="w-full rounded-xl shadow-md">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="flex justify-center mt-4">
            <button
              onClick={handleProceed}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Proceed with the study
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionInput;
