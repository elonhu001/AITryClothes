import React from 'react';
import { GeneratedHistoryItem } from '../types';

interface GalleryProps {
  history: GeneratedHistoryItem[];
  onImageClick: (url: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ history, onImageClick }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-12 px-4">
      <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
        <span className="mr-2">🕒</span> 历史记录
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="group relative aspect-[3/4] bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onImageClick(item.resultImage)}
          >
            <img src={item.resultImage} alt="Result" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                    <img src={item.personImage} className="w-full h-full object-cover"/>
                </div>
                <span className="text-white">+</span>
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                    <img src={item.clothImage} className="w-full h-full object-cover"/>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;