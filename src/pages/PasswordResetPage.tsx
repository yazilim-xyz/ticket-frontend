import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';
import background from '../assets/background.png';

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Backend entegrasyonu yapılacak
      // Bu kısım mock API kullanıyor. Backend hazır olduğunda:
      // 1. API endpoint'i değiştirilecek (örn: POST /api/auth/reset-password)
      // 2. Gerçek email gönderimi yapılacak
      // 3. Token oluşturulup email'e gönderilecek
      
      // Mock API - 1.5 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Password reset link sent to:', email);
      setSuccess(true);

      // 3 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (err: any) {
      console.error('Password reset failed:', err);
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex h-screen">
      {/* Sol Taraf - Background Image */}
      <div className="w-[68%] relative overflow-hidden">
        <img 
          src={background} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Sağ Taraf - Form */}
      <div className={`w-[32%] ${isDarkMode ? 'bg-gray-900' : 'bg-zinc-100'} flex flex-col items-center justify-start px-[75px] py-12 relative overflow-y-auto`}>
        {/* Dark/Light Mode Toggle */}
        <div className="absolute top-8 right-8 flex items-center gap-2">
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
          
          <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500" aria-label="Toggle theme">
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          
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

        {/* Logo */}
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-lg p-0">
          <img src={logo} alt="Enterprise Ticket System Logo" className="w-full h-full object-cover" />
        </div>

        {/* Başlık */}
        <h1 className={`text-2xl font-normal font-['Inter'] ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} text-center mb-1`}>
          Enterprise
        </h1>
        <h2 className={`text-2xl font-normal font-['Inter'] ${isDarkMode ? 'text-teal-400' : 'text-teal-600'} text-center mb-8`}>
          Ticket System
        </h2>

        {/* Password Reset Başlığı */}
        <h3 className={`text-xl font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-black'} text-center mb-3`}>
          Password Reset
        </h3>

        {/* Açıklama Metni */}
        <div className="w-72 mb-6 text-center">
          <p className={`text-base font-normal font-['Inter'] ${isDarkMode ? 'text-gray-300' : 'text-black'} leading-6`}>
            Please enter your company email address to receive a link to reset your password.
          </p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="w-72 flex flex-col gap-4 items-center">
            <div className="w-full p-4 bg-emerald-100 border border-emerald-500 rounded-lg">
              <p className="text-emerald-700 text-sm font-medium text-center">
                ✓ Password reset link sent! Check your email. Redirecting to login...
              </p>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="w-72 flex flex-col gap-3">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email Input */}
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className={`w-full h-10 px-3 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-white border-neutral-200 text-slate-700 placeholder-slate-400'} rounded-lg border text-base font-normal font-['Inter'] focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                required
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full h-10 px-4 bg-emerald-500 rounded-lg text-white text-base font-medium font-['Inter'] hover:bg-emerald-600 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm font-normal font-['Inter'] text-center mt-2">
                {error}
              </p>
            )}

            {/* Back to Login Link */}
            <div className="text-center mt-4">
              <Link 
                to="/login" 
                className={`text-sm font-medium ${isDarkMode ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'} transition-colors`}
              >
                🠔 Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;