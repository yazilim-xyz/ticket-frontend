import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import error403Image from '../assets/error403.png';

const Error403Page: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-zinc-100'} relative`}>
      {/* Dark/Light Mode Toggle - Sağ Üst */}
      <div className="absolute top-8 right-8 flex items-center gap-2">
        {/* Sun Icon */}
        <div className="relative">
          <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          {!isDarkMode && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Switch Toggle */}
        <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500" aria-label="Toggle theme">
          <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} />
        </button>
        
        {/* Moon Icon */}
        <div className="relative">
          <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          {isDarkMode && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 403 Illustration */}
      <div className="mb-8">
        <img 
          src={error403Image} 
          alt="403 Access Denied" 
          className="w-64 h-64 object-contain"
        />
      </div>

      {/* Error Code */}
      <h1 className={`text-6xl font-normal font-['Roboto'] leading-[64px] mb-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>
        403
      </h1>

      {/* Error Message */}
      <p className={`text-xl font-normal font-['Roboto'] leading-7 text-center max-w-[600px] mb-8 ${isDarkMode ? 'text-gray-400' : 'text-black/40'}`}>
        You don't have permission to access this page. Please contact your administrator.
      </p>

      {/* Back Home Button */}
      <button
        onClick={handleBackHome}
        className="px-3.5 py-1 bg-emerald-500 rounded-sm shadow-sm text-white text-sm font-normal font-['Roboto'] leading-5 hover:bg-emerald-600 transition-colors"
      >
        Back Home
      </button>
    </div>
  );
};

export default Error403Page;