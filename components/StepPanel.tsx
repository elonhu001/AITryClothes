import React, { useState } from 'react';
import { Step, ImageAsset } from '../types';
import { fileToBase64, urlToBase64 } from '../utils/imageUtils';
import { generateClothingImage, generateTryOnImage } from '../services/geminiService';

interface StepPanelProps {
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  selectedPerson: string | null;
  setSelectedPerson: (img: string) => void;
  selectedCloth: string | null;
  setSelectedCloth: (img: string) => void;
  setResultImage: (img: string) => void;
  resultImage: string | null;
  onAddToHistory: (result: string) => void;
  onViewResult: (url: string) => void;
  // Library Props
  personLibrary: ImageAsset[];
  clothLibrary: ImageAsset[];
  onAddPersonAsset: (asset: ImageAsset) => void;
  onAddClothAsset: (asset: ImageAsset) => void;
}

const StepPanel: React.FC<StepPanelProps> = ({
  currentStep,
  setCurrentStep,
  selectedPerson,
  setSelectedPerson,
  selectedCloth,
  setSelectedCloth,
  setResultImage,
  resultImage,
  onAddToHistory,
  onViewResult,
  personLibrary,
  clothLibrary,
  onAddPersonAsset,
  onAddClothAsset
}) => {
  const [customClothPrompt, setCustomClothPrompt] = useState('');
  const [isGeneratingCloth, setIsGeneratingCloth] = useState(false);
  const [isGeneratingResult, setIsGeneratingResult] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'cloth') => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        const newAsset: ImageAsset = {
            id: `${type}_${Date.now()}`,
            url: base64,
            isGenerated: false
        };

        if (type === 'person') {
            onAddPersonAsset(newAsset);
            setSelectedPerson(base64);
        } else {
            onAddClothAsset(newAsset);
            setSelectedCloth(base64);
        }
        setErrorMsg(null);
      } catch (err) {
        setErrorMsg('文件读取失败');
      }
    }
  };

  const handleLibrarySelect = async (item: ImageAsset, type: 'person' | 'cloth') => {
    try {
        // If it's already base64 (which it should be for uploaded/generated assets), use it
        if (item.url.startsWith('data:')) {
             if (type === 'person') setSelectedPerson(item.url);
             else setSelectedCloth(item.url);
             return;
        }

        // Fallback for any external URLs
        const base64 = await urlToBase64(item.url);
        if (type === 'person') setSelectedPerson(base64);
        else setSelectedCloth(base64);
        setErrorMsg(null);
    } catch (e) {
        setErrorMsg("无法加载该图片。");
    }
  };

  const handleGenerateCloth = async () => {
    if (!customClothPrompt.trim()) return;
    setIsGeneratingCloth(true);
    setErrorMsg(null);
    try {
      const base64 = await generateClothingImage(customClothPrompt);
      const newCloth: ImageAsset = {
        id: `gen_cloth_${Date.now()}`,
        url: base64,
        isGenerated: true
      };
      onAddClothAsset(newCloth);
      setSelectedCloth(base64);
      setCustomClothPrompt(''); 
    } catch (err) {
      setErrorMsg('生成服装失败，请重试');
    } finally {
      setIsGeneratingCloth(false);
    }
  };

  const handleTryOn = async () => {
    if (!selectedPerson || !selectedCloth) {
        setErrorMsg('请先选择人物和服装');
        return;
    }
    setIsGeneratingResult(true);
    setErrorMsg(null);
    try {
      const resultBase64 = await generateTryOnImage(selectedPerson, selectedCloth);
      setResultImage(resultBase64);
      onAddToHistory(resultBase64);
      setCurrentStep(Step.Result);
    } catch (err) {
      setErrorMsg('试穿生成失败，可能涉及安全策略或网络问题，请换张图重试。');
    } finally {
      setIsGeneratingResult(false);
    }
  };

  const renderNavButtons = () => (
    <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
      <button 
        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
        disabled={currentStep === 1}
        className={`px-6 py-2 rounded-full font-medium transition-colors ${
          currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        上一步
      </button>

      {currentStep < 3 && (
         <button 
         onClick={() => {
             if (currentStep === 1 && !selectedPerson) {
                 setErrorMsg("请先选择或上传一张人物照片");
                 return;
             }
             if (currentStep === 2 && !selectedCloth) {
                 setErrorMsg("请先选择或上传一件服装");
                 return;
             }
             if (currentStep === 2) {
                 handleTryOn();
             } else {
                 setCurrentStep(currentStep + 1);
                 setErrorMsg(null);
             }
         }}
         disabled={isGeneratingResult}
         className="px-8 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all transform hover:scale-105"
       >
         {currentStep === 2 ? (isGeneratingResult ? '正在生成...' : '开始试穿 ✨') : '下一步'}
       </button>
      )}
      
      {currentStep === 3 && (
          <button 
            onClick={() => {
                setCurrentStep(1);
            }}
            className="px-8 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all"
          >
            再试一次
          </button>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-8 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
      
      {errorMsg && (
          <div className="absolute top-0 left-0 w-full bg-red-50 text-red-600 px-6 py-3 text-sm flex justify-between items-center animate-pulse z-50">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="font-bold">✕</button>
          </div>
      )}

      {/* STEP 1: SELECT PERSON */}
      {currentStep === Step.SelectPerson && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">第一步：上传模特</h2>
          
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">上传照片</h3>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">点击上传</span> 或拖拽图片到此处</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'person')} />
            </label>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">我的模特库</h3>
            {personLibrary.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {personLibrary.map((p) => (
                    <button 
                    key={p.id}
                    onClick={() => handleLibrarySelect(p, 'person')}
                    className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all hover:scale-105 focus:outline-none group"
                    style={{ borderColor: selectedPerson === p.url ? '#6366f1' : 'transparent' }}
                    >
                    <img src={p.url} alt="preset" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400 border border-gray-100 rounded-xl bg-gray-50">
                    <p>暂无照片，请先上传</p>
                </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: SELECT CLOTH */}
      {currentStep === Step.SelectCloth && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-gray-800">第二步：选择服装</h2>
             {selectedPerson && (
                 <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                     <span className="text-xs text-gray-500">已选模特</span>
                     <img src={selectedPerson} alt="mini preview" className="w-6 h-6 rounded-full object-cover" />
                 </div>
             )}
           </div>

           {/* AI Generation Section */}
           <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <h3 className="text-sm font-bold text-indigo-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  AI生成服装 (Nano Banana)
              </h3>
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={customClothPrompt}
                    onChange={(e) => setCustomClothPrompt(e.target.value)}
                    placeholder="例如：一件红色的丝绸晚礼服，复古风格..."
                    className="flex-1 px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                  />
                  <button 
                    onClick={handleGenerateCloth}
                    disabled={isGeneratingCloth || !customClothPrompt}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isGeneratingCloth ? '生成中...' : '生成'}
                  </button>
              </div>
           </div>
          
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {/* Upload */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">上传服装</h3>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all">
                        <div className="text-center">
                           <span className="text-sm text-gray-500">上传图片</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cloth')} />
                    </label>
                </div>
                
                {/* Library */}
                <div className="col-span-1 sm:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">我的服装库</h3>
                    {clothLibrary.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-60 overflow-y-auto no-scrollbar p-1">
                            {clothLibrary.map((c) => (
                                <button 
                                key={c.id}
                                onClick={() => handleLibrarySelect(c, 'cloth')}
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 focus:outline-none ${c.isGenerated ? 'ring-2 ring-yellow-400' : ''}`}
                                style={{ borderColor: selectedCloth === c.url ? '#6366f1' : 'transparent' }}
                                >
                                <img src={c.url} alt="cloth" className="w-full h-full object-cover" />
                                {c.isGenerated && <span className="absolute top-0 right-0 bg-yellow-400 text-[10px] font-bold px-1 text-white">AI</span>}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-400 text-sm border border-gray-100 rounded-xl bg-gray-50">
                            暂无服装，请上传或使用AI生成
                        </div>
                    )}
                </div>
           </div>
        </div>
      )}

      {/* STEP 3: RESULT */}
      {currentStep === Step.Result && (
        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 h-full">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">试穿完成! 🎉</h2>
            <p className="text-gray-500 mb-6">您的专属全身体验已生成，已保存至历史记录。</p>
            
            <div className="relative group">
                <div className="flex gap-4">
                     <button 
                       onClick={() => resultImage && onViewResult(resultImage)}
                       className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
                     >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                        <span>放大查看 / 下载</span>
                     </button>
                </div>
            </div>
        </div>
      )}

      {renderNavButtons()}
    </div>
  );
};

export default StepPanel;