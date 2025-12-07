import React, { useState, useEffect } from 'react';
import { Step, GeneratedHistoryItem, ImageAsset } from './types';
import TopCards from './components/TopCards';
import StepPanel from './components/StepPanel';
import Gallery from './components/Gallery';
import ImageModal from './components/ImageModal';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.SelectPerson);
  
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedCloth, setSelectedCloth] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // Libraries for assets with persistence
  const [personLibrary, setPersonLibrary] = useState<ImageAsset[]>(() => {
    try {
      const saved = localStorage.getItem('personLibrary');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load person library", e);
      return [];
    }
  });

  const [clothLibrary, setClothLibrary] = useState<ImageAsset[]>(() => {
    try {
      const saved = localStorage.getItem('clothLibrary');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load cloth library", e);
      return [];
    }
  });
  
  const [history, setHistory] = useState<GeneratedHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  });
  
  // State for image modal
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem('personLibrary', JSON.stringify(personLibrary));
    } catch (e) {
      console.error("Storage full or error saving person library", e);
    }
  }, [personLibrary]);

  useEffect(() => {
    try {
      localStorage.setItem('clothLibrary', JSON.stringify(clothLibrary));
    } catch (e) {
      console.error("Storage full or error saving cloth library", e);
    }
  }, [clothLibrary]);

  useEffect(() => {
    try {
      localStorage.setItem('history', JSON.stringify(history));
    } catch (e) {
      console.error("Storage full or error saving history", e);
    }
  }, [history]);

  const handleAddToHistory = (result: string) => {
    if (selectedPerson && selectedCloth) {
      const newItem: GeneratedHistoryItem = {
        id: Date.now().toString(),
        personImage: selectedPerson,
        clothImage: selectedCloth,
        resultImage: result,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev]);
    }
  };

  const addPersonAsset = (asset: ImageAsset) => {
    setPersonLibrary(prev => [asset, ...prev]);
  };

  const addClothAsset = (asset: ImageAsset) => {
    setClothLibrary(prev => [asset, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-20">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍌</span>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              AI 虚拟换装
            </h1>
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">
            Powered by Gemini Nano Banana
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center pt-6">
        
        {/* Top 3D Cards */}
        <TopCards 
          currentStep={currentStep}
          personImage={selectedPerson}
          clothImage={selectedCloth}
          resultImage={resultImage}
          onImageClick={(url) => setViewingImage(url)}
        />

        {/* Operation Panel */}
        <div className="w-full px-4 -mt-10 z-40">
           <StepPanel 
             currentStep={currentStep}
             setCurrentStep={setCurrentStep}
             selectedPerson={selectedPerson}
             setSelectedPerson={setSelectedPerson}
             selectedCloth={selectedCloth}
             setSelectedCloth={setSelectedCloth}
             setResultImage={setResultImage}
             resultImage={resultImage}
             onAddToHistory={handleAddToHistory}
             onViewResult={(url) => setViewingImage(url)}
             personLibrary={personLibrary}
             clothLibrary={clothLibrary}
             onAddPersonAsset={addPersonAsset}
             onAddClothAsset={addClothAsset}
           />
        </div>

        {/* Gallery */}
        <Gallery 
          history={history} 
          onImageClick={(url) => setViewingImage(url)}
        />

      </main>

      {/* Image Modal */}
      <ImageModal 
        isOpen={!!viewingImage}
        imageUrl={viewingImage}
        onClose={() => setViewingImage(null)}
      />

      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>© 2024 AI Virtual Try-On. Gemini 2.5 Flash Image Model.</p>
        <p className="text-xs mt-1 text-gray-300">Data is saved locally in your browser.</p>
      </footer>
    </div>
  );
};

export default App;