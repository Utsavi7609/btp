import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle } from 'lucide-react';

const DriftEmotionPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [emotionData, setEmotionData] = useState({
    // emotion: 'Neutral',
    // intensity: 3,
    valence: 3,
    arousal: 3,
    timestamp: new Date().toISOString(), // Capture current timestamp
    submittype: 'drift-emotion-' + currentStep // Add it to the payload
  });
  const [responses, setResponses] = useState([]);
  const [isFinalSubmit, setIsFinalSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [playTimerStarted, setPlayTimerStarted] = useState(false);
  const [canReportEmotion, setCanReportEmotion] = useState(false);
  const [hasVideoEnded, setHasVideoEnded] = useState(false);


  const videoRef = useRef(null);
  const userID = sessionStorage.getItem('userID');
  
  // logic for flipping the valence and arousal values : the next form loads a video
  const flipEmotionData = (data) => {
    return {
      ...data,
      valence: 6 - data.valence,
      arousal: 6 - data.arousal
    };
  };    

  const fetchVideo = async () => {
    setLoading(true);

    
    const updatedEmotionData = {
      ...emotionData,
      timestamp: new Date().toISOString(),
      submittype: 'drift-emotion-' + currentStep,
      userID: userID // Include userID in the payload
    };
  
    try {
      const res = await fetch('http://localhost:5000/api/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEmotionData),
      });
  
      if (res.ok) {
        const videoBlob = await res.blob();
        setVideoUrl(URL.createObjectURL(videoBlob));
        setHasVideoEnded(false); // Reset when a new video loads
        setVideoWatched(true);
      } else {
        console.error('Failed to fetch video');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handlePlay = () => {
    if (!playTimerStarted) {
      setPlayTimerStarted(true);
      setTimeout(() => {
        setCanReportEmotion(true);
      }, 3000); // Button activation delay :: until video has been played and 3 seconds have passed
    }
  };

  const handleEmotionSubmit = () => {
    const updatedData = {
      valence: emotionData.valence,
      arousal: emotionData.arousal,
      timestamp: new Date().toISOString(),
      submittype: 'drift-emotion-' + currentStep
    };    
  
    setResponses([...responses, updatedData]);
  
    const flippedData = flipEmotionData(updatedData); // << flip valence and arousal
    setEmotionData(flippedData); // << save flipped data for next form
  
    setVideoUrl(null);
    setFormVisible(false);
    setVideoWatched(false);
    setCanReportEmotion(false);
    setPlayTimerStarted(false);
  
    if (currentStep === 3) {
      setIsFinalSubmit(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#94BAD9] p-6">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl">
          <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${20 + responses.length * 20}%` }}
            />
          </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Drift Emotion Study</h1>
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-blue-600 bg-transparent p-2 rounded-full"
            title="Restart test"
          >
            <ArrowLeftCircle size={28} />
          </button>
        </div>

        {!videoWatched && !formVisible && !isFinalSubmit && (
          <button
            onClick={fetchVideo}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Loading...' : `Watch the ${currentStep + 1}th video`}
          </button>
        )}

        {videoUrl && (
          <div className="space-y-4 mt-6">
            <video
              ref={videoRef}
              controls
              className="w-full rounded-xl shadow-md"
              onPlay={handlePlay}
              onEnded={() => setHasVideoEnded(true)} // NEW: detect when video ends
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* <button
              onClick={() => setFormVisible(true)}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={!canReportEmotion || formVisible} // Disabled until 3s has passed
              >
              Report emotion for {currentStep + 1}th video
              </button>
            > */}
            <button
              onClick={() => setFormVisible(true)}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={!hasVideoEnded || formVisible} // <<< use hasVideoEnded
            >
              Report emotion for {currentStep + 1}th video
            </button>

            {!canReportEmotion && !formVisible && (
              <p className="text-sm text-gray-600 text-center mt-2">
                ⏳ Please watch the video before reporting your emotions.
              </p>
            )}

          </div>
        )}

        {formVisible && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">Report your emotions</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {/* <div>
                <p className="font-semibold mb-2">What was your emotion?</p>
                <div className="flex space-x-4">
                  {['Anger', 'Fear', 'Neutral', 'Happiness', 'Sadness', 'Other'].map((emotion) => (
                    <label key={emotion} className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name="emotion"
                        value={emotion}
                        checked={emotionData.emotion === emotion}
                        onChange={(e) => setEmotionData({ ...emotionData, emotion: e.target.value })}
                      />
                      <span>{emotion}</span>
                    </label>
                  ))}
                </div>
              </div> */}

              {/* <div>
                <p className="font-semibold mb-2">Intensity of the emotion?</p>
                <input
                  type="range"
                  name="intensity"
                  min="1"
                  max="5"
                  value={emotionData.intensity}
                  onChange={(e) => setEmotionData({ ...emotionData, intensity: e.target.value })}
                  className="w-full accent-blue-600"
                />
              </div> */}

              <div>
                <p className="font-semibold mb-2">Are you feeling Negative or Positive (Valence level)?</p>
                <input
                  type="range"
                  name="valence"
                  min="1"
                  max="5"
                  value={emotionData.valence}
                  onChange={(e) => setEmotionData({ ...emotionData, valence: e.target.value })}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span key={num}>{num}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">Are you feeling calm or excited (Arousal level)?</p>
                <input
                  type="range"
                  name="arousal"
                  min="1"
                  max="5"
                  value={emotionData.arousal}
                  onChange={(e) => setEmotionData({ ...emotionData, arousal: e.target.value })}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span key={num}>{num}</span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleEmotionSubmit}
                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
              >
                Submit Emotion Data
              </button>

            </form>
          </div>
        )}

        {isFinalSubmit && (
          <button
            onClick={() => {
              // alert('Thank you for completing the study!');
              navigate('/thank-you');
            }}
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 mt-6"
          >
            Final Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default DriftEmotionPage;
