import React, { useState, useCallback } from 'react';
import { UploadZone } from './components/UploadZone';
import { generateBase3D, generateRoofLayer, applyTextures } from './services/geminiService';
import { AppState, GenerationResult } from './types';
import { Layers, Wand2, ChevronRight, Download, CheckCircle2, Loader2, Building2, Hammer, PaintBucket } from 'lucide-react';

function App() {
  const [floorplan, setFloorplan] = useState<string | null>(null);
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [results, setResults] = useState<GenerationResult>({ step1Url: null, step2Url: null, step3Url: null });
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!floorplan || !frontPhoto) return;

    setState(AppState.GENERATING_STEP_1);
    setError(null);
    setResults({ step1Url: null, step2Url: null, step3Url: null });

    try {
      // Step 1: Base 3D Geometry
      const step1 = await generateBase3D(floorplan);
      setResults(prev => ({ ...prev, step1Url: step1 }));
      
      // Step 2: Add Roof Structure
      setState(AppState.GENERATING_STEP_2);
      const step2 = await generateRoofLayer(step1);
      setResults(prev => ({ ...prev, step2Url: step2 }));

      // Step 3: Apply Textures
      setState(AppState.GENERATING_STEP_3);
      const step3 = await applyTextures(step2, frontPhoto);
      setResults(prev => ({ ...prev, step3Url: step3 }));
      
      setState(AppState.COMPLETE);
    } catch (err) {
      console.error(err);
      setError("The design process was interrupted. Please try again.");
      setState(AppState.ERROR);
    }
  }, [floorplan, frontPhoto]);

  const handleReset = () => {
    setFloorplan(null);
    setFrontPhoto(null);
    setResults({ step1Url: null, step2Url: null, step3Url: null });
    setState(AppState.IDLE);
    setError(null);
  };

  const canGenerate = floorplan && frontPhoto && state === AppState.IDLE;

  // Helper to render progress steps
  const renderStepIndicator = (stepState: AppState, label: string, icon: React.ReactNode, isActive: boolean, isCompleted: boolean) => (
    <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${isActive ? 'scale-110 opacity-100' : isCompleted ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 
        ${isCompleted ? 'bg-green-100 border-green-500 text-green-600' : 
          isActive ? 'bg-indigo-100 border-indigo-600 text-indigo-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isActive ? <Loader2 className="w-6 h-6 animate-spin" /> : icon}
      </div>
      <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>{label}</span>
    </div>
  );

  const isProcessing = state === AppState.GENERATING_STEP_1 || state === AppState.GENERATING_STEP_2 || state === AppState.GENERATING_STEP_3;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">HomeVision<span className="text-indigo-600">3D</span></h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini Nano Banana
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        {state === AppState.IDLE && (
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
              3-Stage Architectural <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Pipeline Generation</span>
            </h2>
            <p className="text-lg text-slate-600">
              Upload a floorplan and front photo. We'll generate a 3D model, construct a transparent roof, and apply real-world textures sequentially.
            </p>
          </div>
        )}

        {/* Input Section */}
        <div className={`grid md:grid-cols-2 gap-6 mb-8 transition-all duration-500 ${state !== AppState.IDLE ? 'hidden' : ''}`}>
          <UploadZone 
            label="1. Floorplan" 
            description="Drop your floorplan image here"
            image={floorplan}
            onImageUpload={(_, base64) => setFloorplan(base64)}
            onClear={() => setFloorplan(null)}
          />
          <UploadZone 
            label="2. Front Photo" 
            description="Drop a photo of the house front here"
            image={frontPhoto}
            onImageUpload={(_, base64) => setFrontPhoto(base64)}
            onClear={() => setFrontPhoto(null)}
          />
        </div>

        {/* Action Bar */}
        {state === AppState.IDLE && (
          <div className="flex justify-center mb-16">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`
                flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all
                ${canGenerate 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200 hover:scale-105 cursor-pointer' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
              `}
            >
              <Wand2 className="w-5 h-5" />
              Start Generation Pipeline
            </button>
          </div>
        )}

        {/* Progress Tracker */}
        {state !== AppState.IDLE && state !== AppState.ERROR && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex justify-between items-start relative">
              {/* Connecting Line */}
              <div className="absolute top-6 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
              
              {renderStepIndicator(
                state, 
                "1. Geometry", 
                <Building2 className="w-5 h-5" />, 
                state === AppState.GENERATING_STEP_1, 
                results.step1Url !== null
              )}
              
              {renderStepIndicator(
                state, 
                "2. Structure", 
                <Hammer className="w-5 h-5" />, 
                state === AppState.GENERATING_STEP_2, 
                results.step2Url !== null
              )}
              
              {renderStepIndicator(
                state, 
                "3. Texturing", 
                <PaintBucket className="w-5 h-5" />, 
                state === AppState.GENERATING_STEP_3, 
                results.step3Url !== null
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {state === AppState.ERROR && (
          <div className="max-w-md mx-auto bg-red-50 p-6 rounded-xl text-center border border-red-200">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button 
              onClick={handleReset}
              className="text-sm font-semibold text-red-700 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Section */}
        {(isProcessing || state === AppState.COMPLETE) && (
          <div className="grid lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-10 duration-700">
            
            {/* Main Stage - Always shows the LATEST available image or a loader */}
            <div className="lg:col-span-8 flex flex-col gap-4">
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1 overflow-hidden">
                  <div className="bg-slate-900 rounded-xl min-h-[500px] flex items-center justify-center relative overflow-hidden group">
                     {/* Determine which image to show based on state priority */}
                     {(results.step3Url || results.step2Url || results.step1Url) ? (
                       <img 
                         src={results.step3Url || results.step2Url || results.step1Url || ''} 
                         alt="Design Stage" 
                         className="w-full h-full object-contain animate-in fade-in duration-500"
                       />
                     ) : (
                       <div className="text-white/40 flex flex-col items-center">
                         <Building2 className="w-12 h-12 mb-4 animate-bounce" />
                         <p>Initializing 3D Engine...</p>
                       </div>
                     )}
                     
                     {state === AppState.COMPLETE && results.step3Url && (
                        <a 
                        href={results.step3Url} 
                        download="final-render.png"
                        className="absolute bottom-6 right-6 bg-white text-indigo-900 px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold hover:scale-105 transition-transform cursor-pointer z-10"
                      >
                        <Download className="w-5 h-5" />
                        Download Final Render
                      </a>
                     )}
                  </div>
               </div>
               <div className="flex justify-between items-center px-2">
                  <h3 className="text-xl font-bold text-slate-800">
                    {state === AppState.COMPLETE ? 'Final Design' : 'Current Stage View'}
                  </h3>
                  {state === AppState.COMPLETE && (
                    <button onClick={handleReset} className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                      Start New Project <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
               </div>
            </div>

            {/* Evolution Strip (Sidebar) */}
            <div className="lg:col-span-4 space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Design Evolution</h4>
              
              {/* Step 1 Card */}
              <div className={`bg-white p-3 rounded-xl border ${results.step1Url ? 'border-indigo-100 shadow-sm' : 'border-slate-100 opacity-50'}`}>
                <div className="aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden relative">
                  {results.step1Url ? (
                    <img src={results.step1Url} className="w-full h-full object-cover" alt="Step 1" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">1. 3D Geometry</span>
                  {results.step1Url && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Done</span>}
                </div>
              </div>

              {/* Step 2 Card */}
              <div className={`bg-white p-3 rounded-xl border ${results.step2Url ? 'border-indigo-100 shadow-sm' : 'border-slate-100 opacity-50'}`}>
                <div className="aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden relative">
                  {results.step2Url ? (
                    <img src={results.step2Url} className="w-full h-full object-cover" alt="Step 2" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <Hammer className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">2. Transparent Roof</span>
                  {results.step2Url && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Done</span>}
                </div>
              </div>

              {/* Step 3 Card (Preview slot, though mostly duplicate of main view, serves as history) */}
              <div className={`bg-white p-3 rounded-xl border ${results.step3Url ? 'border-indigo-100 shadow-sm' : 'border-slate-100 opacity-50'}`}>
                <div className="aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden relative">
                  {results.step3Url ? (
                    <img src={results.step3Url} className="w-full h-full object-cover" alt="Step 3" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <PaintBucket className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">3. Style Transfer</span>
                  {results.step3Url && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Done</span>}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
