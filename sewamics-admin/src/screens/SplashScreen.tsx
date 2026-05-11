import React from 'react';
import { useNavigate } from 'react-router-dom';
import newSplashScreen from '../assets/brand/newSplashScreen.png';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/placeholder');
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center font-zalando overflow-hidden">
      {/* Brand Image - Centered and Floating */}
      <div className="animate-float mb-4">
        <img 
          src={newSplashScreen} 
          alt="SewaMics Logo" 
          className="w-72 md:w-80 object-contain"
        />
      </div>

      {/* Main Content Group */}
      <div className="text-center px-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-black text-brand-orange mb-4 tracking-tighter">
          Welcome, Admin!
        </h1>
        
        <p className="text-gray-500 font-medium text-lg md:text-xl mb-10 leading-snug">
          Welcome to SewaMic's admin web app where you're free to run wild depending on your admin role ;)
        </p>

        {/* Modern Button Animation */}
        <button 
          onClick={handleLogin}
          className="group relative px-16 py-4 bg-brand-orange text-white font-black rounded-full 
                   transition-all duration-500 ease-out uppercase tracking-widest text-sm
                   hover:scale-105 hover:bg-orange-400
                   active:scale-95 shadow-[0_10px_20px_-10px_rgba(255,145,77,0.5)]
                   hover:shadow-[0_20px_40px_-10px_rgba(255,145,77,0.6)]"
        >
          <span className="relative z-10">login</span>
          {/* Subtle reflection effect on hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
