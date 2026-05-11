import React from 'react';
import loadingSwirl from '../assets/brand/loadingSwirl.png';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center font-zalando z-50">
      {/* Rotating Swirl */}
      <div className="w-28 h-28 mb-8">
        <img 
          src={loadingSwirl} 
          alt="Loading..." 
          className="w-full h-full object-contain animate-loading-swirl"
        />
      </div>
      
      {/* Loading Text */}
      <p className="text-2xl font-black text-brand-orange tracking-tight">
        Wait, cooking up...
      </p>
    </div>
  );
};

export default LoadingScreen;
