import React from 'react';
import { Step } from '../types';

interface TopCardsProps {
  currentStep: Step;
  personImage: string | null;
  clothImage: string | null;
  resultImage: string | null;
  onImageClick: (url: string) => void;
}

const TopCards: React.FC<TopCardsProps> = ({ currentStep, personImage, clothImage, resultImage, onImageClick }) => {
  
  const getCardStyle = (index: number) => {
    // 1 -> -6deg, 2 -> 0deg, 3 -> 6deg
    const rotateClass = index === 1 ? '-rotate-6' : index === 2 ? 'rotate-0' : 'rotate-6';
    const translateClass = index === 2 ? '-translate-y-4' : 'translate-y-0';
    const zIndex = index === 2 ? 'z-20' : 'z-10';
    
    return `relative w-1/3 max-w-[200px] aspect-[3/4] rounded-2xl shadow-xl transition-all duration-500 transform ${rotateClass} ${translateClass} ${zIndex} border-4 border-white overflow-hidden bg-white hover:rotate-0 hover:scale-105 hover:z-30 cursor-pointer group`;
  };

  const CardContent = ({ step, image, label }: { step: number, image: string | null, label: string }) => (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center bg-gray-100 ${image ? '' : 'p-4'}`}
      onClick={() => image && onImageClick(image)}
    >
      {image ? (
        <>
           <img src={image} alt={label} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
             <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
             </svg>
           </div>
        </>
      ) : (
        <div className="text-gray-400 flex flex-col items-center text-center">
          <span className="text-2xl font-bold opacity-20 mb-2">0{step}</span>
          <span className="text-sm font-medium text-gray-400">{label}</span>
        </div>
      )}
      {/* Active Indicator */}
      {currentStep === step && (
        <div className="absolute inset-0 border-4 border-indigo-500 rounded-xl pointer-events-none animate-pulse"></div>
      )}
    </div>
  );

  return (
    <div className="w-full flex justify-center items-center py-8 px-4 h-64 sm:h-80 mb-6 bg-gradient-to-b from-indigo-50 to-white">
      <div className="flex w-full max-w-2xl justify-center items-center space-x-[-20px] sm:space-x-4">
        
        {/* Card 1: Person */}
        <div className={getCardStyle(1)}>
          <CardContent step={1} image={personImage} label="人物" />
        </div>

        {/* Card 2: Cloth */}
        <div className={getCardStyle(2)}>
          <CardContent step={2} image={clothImage} label="服装" />
        </div>

        {/* Card 3: Result */}
        <div className={getCardStyle(3)}>
          <CardContent step={3} image={resultImage} label="试穿效果" />
        </div>

      </div>
    </div>
  );
};

export default TopCards;