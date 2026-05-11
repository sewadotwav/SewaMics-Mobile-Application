import React from 'react';
import newSplashScreen from '../assets/brand/newSplashScreen.png';

const PlaceholderScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center font-zalando p-6 text-center">
      {/* Brand Image - Consistent floating effect */}
      <div className="animate-float mb-4">
        <img 
          src={newSplashScreen} 
          alt="SewaMics Logo" 
          className="w-72 md:w-80 object-contain"
        />
      </div>

      {/* Main Text */}
      <h1 className="text-5xl md:text-6xl font-black text-brand-orange tracking-tighter">
        wait lang, di pa tapos
      </h1>
      
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-brand-orange/20 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-brand-orange/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-2 h-2 bg-brand-orange/60 rounded-full animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
};

export default PlaceholderScreen;
