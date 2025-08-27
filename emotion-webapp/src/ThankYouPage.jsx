import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ children, className }) => (
  <div className={`bg-[#BFDDF5] rounded-3xl shadow-3xl p-10 ${className}`}>{children}</div>
);

const CardContent = ({ children }) => <div>{children}</div>;

const Button = ({ children, className, ...props }) => (
  <button
    className={`bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

const ThankYouPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#94BAD9] p-6">
      <Card className="w-full max-w-2xl mx-auto rounded-xl shadow-xl overflow-hidden">
        <CardContent className="p-10 text-center">
          <h1 className="text-4xl font-bold mb-6">Thank You!</h1>
          <p className="text-lg text-gray-700 mb-6">
            We appreciate your participation in our emotion study. Your responses have been recorded.
          </p>
          <p className="text-md text-gray-600 mb-8">
            Feel free to close this window or return to the homepage to participate again.
          </p>
          <div className="flex justify-center">
            <Link to="/">
                <Button className="text-lg px-8 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                Go to Homepage
                </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYouPage;
