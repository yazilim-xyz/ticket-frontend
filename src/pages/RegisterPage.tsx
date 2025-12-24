import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';
import background from '../assets/background.png';
import { authService } from '../services/authService';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    Name: '',
    Surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailExists, setIsEmailExists] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Email değiştiğinde error'u temizle
    if (e.target.name === 'email') {
      setIsEmailExists(false);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsEmailExists(false);
    setSuccessMessage('');

    // Password match kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Password validation - min 8 karakter
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        Name: formData.Name,
        Surname: formData.Surname,
        email: formData.email,
        password: formData.password,
      });

      console.log('Registration successful:', response);
      
      //Başarılı mesajı göster - Admin onayı bekliyor
      setSuccessMessage(
        '✅ Your registration has been successfully completed. Your account has been submitted for administrator approval. \n\n' +
        '📧 You will be notified via email once the approval process is completed. After approval, you may sign in using your registered credentials. \n\n' +
        '⏳ You are being redirected to the welcome page…'
      );

      // 5 saniye sonra welcome sayfasına yönlendir
      setTimeout(() => {
        navigate('/');
      }, 5000);

    } catch (err: any) {
      console.error('Registration failed:', err);

      if (err.message === 'This email is already registered') {
        setIsEmailExists(true);
        setError('This email is already registered.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sol Taraf - Background Image */}
      <div className="flex-1 relative overflow-hidden">
        <img 
          src={background} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Sağ Taraf - Form */}
      <div className={`w-[32%] min-w-[400px] ${isDarkMode ? 'bg-gray-900' : 'bg-zinc-100'} flex flex-col items-center justify-start px-[75px] py-12 relative overflow-y-auto`}>
        {/* Dark/Light Mode Toggle - Sağ Üst */}
        <div className="absolute top-8 right-8 flex items-center gap-2">
          {/* Sun Icon with Tick */}
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
          <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500"
            aria-label="Toggle theme"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                isDarkMode ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          
          {/* Moon Icon with Tick */}
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

        {/* Scrollable Content Container */}
        <div className="flex flex-col items-center w-full max-w-[320px] mx-auto">
          {/* Logo */}
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg p-0 flex-shrink-0">
            <img 
              src={logo} 
              alt="Enterprise Ticket System Logo" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Başlık */}
          <h1 className={`text-2xl font-normal font-['Inter'] ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} text-center mb-1`}>
            Enterprise
          </h1>
          <h2 className={`text-2xl font-normal font-['Inter'] ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} text-center mb-8`}>
            Ticket System
          </h2>

          {/* Register Form */}
          <div className="w-80 flex flex-col gap-4">
            <h3 className={`text-xl font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-black'} text-center mb-3`}>
              Register Now
            </h3>

            {/* Info Text */}
            <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-zinc-500'} text-sm font-normal font-['Inter']`}>
              To complete your registration, please click the{' '}
              <span className="font-bold">'Complete Registration'</span> button.
            </p>

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-emerald-100 border border-emerald-500 rounded-lg">
                <p className="text-emerald-700 text-sm font-medium text-center">
                  ✓ {successMessage}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full Name Input */}
              <input
                type="text"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                placeholder="Name"
                className={`w-full h-9 px-4 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-white border-neutral-200 text-slate-700 placeholder-slate-400'} rounded-lg border text-base font-normal font-['Inter'] focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                required
              />
              <input
                type="text"
                name="Surname"
                value={formData.Surname}
                onChange={handleChange}
                placeholder="Surname"
                className={`w-full h-9 px-4 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-white border-neutral-200 text-slate-700 placeholder-slate-400'} rounded-lg border text-base font-normal font-['Inter'] focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                required
              />

              {/* Email Input */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@domain.com"
                className={`w-full h-9 px-4 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-white border-neutral-200 text-slate-700 placeholder-slate-400'} rounded-lg border text-base font-normal font-['Inter'] focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                required
              />

              {/* Password Input */}
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min. 8 characters)"
                className={`w-full h-9 px-4 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-white border-neutral-200 text-slate-700 placeholder-slate-400'} rounded-lg border text-base font-normal font-['Inter'] focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                required
                minLength={8}
              />

              {/* Confirm Password Input */}
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className={`w-full h-9 px-4 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-white border-neutral-200 text-slate-700 placeholder-slate-400'} rounded-lg border text-base font-normal font-['Inter'] focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                required
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !!successMessage}
                className={`w-full h-9 px-4 bg-emerald-500 rounded-lg text-white text-base font-medium font-['Inter'] hover:bg-emerald-600 transition-colors ${
                  isLoading || successMessage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>

            {/* Email Exists Warning */}
            {isEmailExists && (
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                <p className="text-red-600 text-xs font-medium text-center mb-1">
                  This email is already registered!
                </p>
                <p className={`text-[10px] text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Already have an account?
                </p>
                <Link 
                  to="/login"
                  className="block w-full text-center py-1.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            )}
            
            {/* Error Message */}
            {error && !isEmailExists && (
              <p className="text-red-500 text-xs font-normal font-['Inter'] text-center">
                {error}
              </p>
            )}

            {/* Already have account? */}
            <div className="text-center mt-2">
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-zinc-500'} text-xs font-normal font-['Inter']`}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className={`${isDarkMode ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'} font-medium transition-colors`}
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Terms Text */}
            <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-zinc-500'} text-[11px] font-normal font-['Inter'] leading-relaxed mt-1`}>
              By clicking continue, you agree to our{' '}
              <span className={`${isDarkMode ? 'text-white' : 'text-black'} font-normal`}>Terms of Service</span>
              {' '}and{' '}
              <span className={`${isDarkMode ? 'text-white' : 'text-black'} font-normal`}>Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;