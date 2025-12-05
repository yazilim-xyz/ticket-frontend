import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import logo from '../assets/logo.png'; 
import background from '../assets/background.png';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate(); 
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100); 

    return () => clearTimeout(timer);
  }, []);

  const contentClasses = `transition-opacity duration-1000 ease-in ${
    isMounted ? 'opacity-100' : 'opacity-0'
  }`;
  
  // giriş yapa tıklandığında login yönlendirmesi
  const handleLoginClick = () => {
    navigate('/login'); 
  };

  //hakkımızdaya tıklandığında hakkımızda yçnlendirilmesi
  const handleAboutUsClick = () => {
    navigate('/hakkimizda'); 
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 relative overflow-hidden text-white font-sans">
      <img 
        src={background} 
        alt="Arka Plan Deseni" 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-black/80 to-gray-950 opacity-90"></div>
      
      <div className="relative z-10">

        {/*header*/}
        <header className={`p-4 flex justify-between items-center ${contentClasses}`}>
          
          <div className="flex items-center space-x-2">
            <img 
              src={logo} 
              alt="Enterprise Ticket System Logo" 
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col leading-none">
              <span className="text-teal-500 text-lg font-normal">Enterprise</span>
              <span className="text-teal-500 text-lg font-normal -mt-1">Ticket System</span>
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <a 
            onClick={handleAboutUsClick} 
              className="text-white text-base font-normal hover:text-teal-400 transition hover:underline"
            >
              About Us
            </a>
          </nav>
        </header>
        
        {/*hoş geldniz kısmı*/}
        <hr className="border-t border-transparent" />

        <main className={`pt-28 pb-16 flex flex-col items-center justify-center text-center ${contentClasses}`}>          
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-zinc-100 italic">
             Hello & Welcome
          </h1>
          
          <p className="text-lg font-semibold mb-8 text-zinc-300 max-w-2xl italic">
             The fastest and most efficient way to manage all your corporate support requests.
          </p>

          <button 
            onClick={handleLoginClick}
            className="px-8 py-3 bg-emerald-500 rounded-full shadow-lg hover:bg-emerald-600 transition duration-300 text-white text-lg font-semibold"
          >
            SIGN IN
          </button>
        </main>

        {/*alttaki kısım*/}
        <section className={`pt-16 pb-28 px-8 ${contentClasses} delay-200`}> 
          
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12 text-zinc-100">
             Why Enterprise Ticket System?
             </h2>

          {/* kartlar */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-5 bg-transparent rounded-lg shadow-2xl border-2 border-teal-600">
              <h3 className="text-lg font-semibold mb-2 text-white text-center italic"> Central Management</h3>
              <p className="text-base font-normal text-zinc-300 text-center leading-relaxed">
                 All your support requests,issues, and tasks in one place.Remove complexity and maintain clarity.
              </p>
            </div>

            <div className="p-5 bg-transparent rounded-lg shadow-2xl border-2 border-teal-600">
              <h3 className="text-lg font-semibold mb-2 text-white text-center italic">Advanced Analytics & Reporting</h3>
              <p className="text-base font-normal text-zinc-300 text-center leading-relaxed">
                 Easily analyze your team's performance, resolution times, and the most common issues.
                </p>
            </div>

            <div className="p-5 bg-transparent rounded-lg shadow-2xl border-2 border-teal-600">
              <h3 className="text-lg font-semibold mb-2 text-white text-center italic"> Fast Resolution & Tracking</h3>
              <p className="text-base font-normal text-zinc-300 text-center leading-relaxed">
                Assign requests instantly to the right teams,prioritize them, and track resolution progress in real-time.
              </p>
            </div>
          </div>
        </section>

        {/*footer*/}
        <footer className={`w-full bg-gray-950/70 py-4 ${contentClasses} delay-500`}>
          <p className="text-center text-sm opacity-60 text-white font-semibold">
            © 2025 Enterprise Ticket System. All rights reserved
          </p>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePage;