
import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Settings2, 
  ArrowRight, 
  RefreshCw,
  X,
  Loader2,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { 
  AspectRatio, 
  LightingStyle, 
  CameraPerspective, 
  StudioSettings, 
  ProcessingState 
} from './types';
import { generateDetailedPrompt, generateImage } from './services/geminiService';
import { SettingsGroup, SettingButton } from './components/SettingsGroup';

const App: React.FC = () => {
  // Image States
  const [productImage, setProductImage] = useState<string | null>(null);
  const [styleReference, setStyleReference] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Settings States
  const [settings, setSettings] = useState<StudioSettings>({
    aspectRatio: "1:1",
    lighting: LightingStyle.STUDIO,
    perspective: CameraPerspective.EYE_LEVEL,
  });

  // Flow States
  const [prompt, setPrompt] = useState<string>("");
  const [processing, setProcessing] = useState<ProcessingState>({
    isGeneratingPrompt: false,
    isGeneratingImage: false,
    error: null,
  });

  const productInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'style') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') setProductImage(reader.result as string);
        else setStyleReference(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (type: 'product' | 'style' | 'generated') => {
    if (type === 'product') setProductImage(null);
    else if (type === 'style') setStyleReference(null);
    else setGeneratedImage(null);
  };

  const handleGeneratePrompt = async () => {
    if (!productImage) return;
    
    setProcessing(prev => ({ ...prev, isGeneratingPrompt: true, error: null }));
    try {
      const generatedPrompt = await generateDetailedPrompt(settings, productImage, styleReference || undefined);
      setPrompt(generatedPrompt);
    } catch (err) {
      setProcessing(prev => ({ ...prev, error: "Failed to generate prompt. Please try again." }));
    } finally {
      setProcessing(prev => ({ ...prev, isGeneratingPrompt: false }));
    }
  };

  const handleGenerateImage = async () => {
    if (!productImage || !prompt) return;

    setProcessing(prev => ({ ...prev, isGeneratingImage: true, error: null }));
    try {
      const resultImageUrl = await generateImage(
        prompt, 
        productImage, 
        settings.aspectRatio, 
        styleReference || undefined
      );
      setGeneratedImage(resultImageUrl);
    } catch (err) {
      setProcessing(prev => ({ ...prev, error: "Generation failed. Ensure your images are clear." }));
    } finally {
      setProcessing(prev => ({ ...prev, isGeneratingImage: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-1.5 rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.3)]">
              <Camera className="w-5 h-5 text-zinc-900" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">BananaStudio <span className="text-yellow-400">AI</span></h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
            <span className="flex items-center gap-1.5"><Layers className="w-3 h-3" /> Context Replication Engine</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs & Settings */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Product Upload Area */}
          <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
            <h2 className="flex items-center gap-2 text-sm font-semibold mb-4 text-zinc-300">
              <Upload className="w-4 h-4 text-zinc-500" /> 1. Upload Product Photo
            </h2>
            <div className="relative">
              {productImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-black aspect-square max-h-80 flex items-center justify-center">
                  <img src={productImage} alt="Product" className="max-w-full max-h-full object-contain" />
                  <button 
                    onClick={() => clearImage('product')}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/80 rounded-full transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => productInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-800 rounded-xl aspect-square max-h-80 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-zinc-600 hover:bg-zinc-800/30 transition-all group"
                >
                  <div className="bg-zinc-800 p-4 rounded-full group-hover:scale-110 transition-transform group-hover:bg-zinc-700">
                    <ImageIcon className="w-8 h-8 text-zinc-500 group-hover:text-zinc-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-zinc-300">Target Product</p>
                    <p className="text-xs text-zinc-500 mt-1">Upload the item to transform</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={productInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, 'product')} 
              />
            </div>
          </section>

          {/* Style Controls */}
          <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold mb-6 text-zinc-300">
              <Settings2 className="w-4 h-4 text-zinc-500" /> 2. Studio Parameters
            </h2>
            
            <SettingsGroup label="Aspect Ratio">
              {(["1:1", "3:4", "4:3", "9:16", "16:9"] as AspectRatio[]).map(ratio => (
                <SettingButton 
                  key={ratio} 
                  active={settings.aspectRatio === ratio}
                  onClick={() => setSettings(s => ({ ...s, aspectRatio: ratio }))}
                >
                  {ratio}
                </SettingButton>
              ))}
            </SettingsGroup>

            <SettingsGroup label="Lighting Style">
              {Object.values(LightingStyle).map(light => (
                <SettingButton 
                  key={light} 
                  active={settings.lighting === light}
                  onClick={() => setSettings(s => ({ ...s, lighting: light }))}
                >
                  {light}
                </SettingButton>
              ))}
            </SettingsGroup>

            <SettingsGroup label="Camera Perspective">
              {Object.values(CameraPerspective).map(persp => (
                <SettingButton 
                  key={persp} 
                  active={settings.perspective === persp}
                  onClick={() => setSettings(s => ({ ...s, perspective: persp }))}
                >
                  {persp}
                </SettingButton>
              ))}
            </SettingsGroup>

            <div className="mt-8">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                Target Context (Style Reference)
              </label>
              <div 
                onClick={() => styleInputRef.current?.click()}
                className={`relative rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/30 transition-all overflow-hidden h-36 ${styleReference ? 'border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.05)]' : 'border-dashed border-zinc-800'}`}
              >
                {styleReference ? (
                  <>
                    <img src={styleReference} alt="Style" className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); clearImage('style'); }}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black rounded-full backdrop-blur-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-yellow-400 text-zinc-950 text-[10px] font-black py-1 text-center uppercase tracking-widest">
                      Context Locked
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <Layers className="w-6 h-6 opacity-30" />
                    <span className="text-xs font-semibold">Upload "Clone" Reference</span>
                    <span className="text-[10px] opacity-50 px-6 text-center">We will replicate this exact background & lighting</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={styleInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, 'style')} 
                />
              </div>
            </div>

            <button
              onClick={handleGeneratePrompt}
              disabled={!productImage || processing.isGeneratingPrompt}
              className="w-full mt-8 bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
            >
              {processing.isGeneratingPrompt ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-yellow-500 group-hover:rotate-12 transition-transform" />
              )}
              {prompt ? "Update Scene Description" : "Generate Scene Prompt"}
            </button>
          </section>
        </div>

        {/* Right Column: Prompt & Output */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Prompt Editor */}
          <section className={`bg-zinc-900/30 border rounded-2xl p-6 transition-all duration-500 ${prompt ? 'border-yellow-400/40 shadow-[0_0_25px_rgba(250,204,21,0.05)]' : 'border-zinc-800'}`}>
            <h2 className="flex items-center justify-between text-sm font-semibold mb-4 text-zinc-300">
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" /> 3. Context Analysis Prompt</span>
              {prompt && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </h2>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="The detailed scene description will appear here... you can manually edit it to fine-tune the replication."
                className="w-full h-32 bg-black/40 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none leading-relaxed font-mono"
              />
              {processing.isGeneratingPrompt && (
                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-3" />
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Analyzing Reference Aesthetics...</p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleGenerateImage}
              disabled={!prompt || processing.isGeneratingImage}
              className="w-full mt-4 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs shadow-[0_4px_20px_rgba(250,204,21,0.2)]"
            >
              {processing.isGeneratingImage ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Merging Product into Context...
                </>
              ) : (
                <>
                  Generate Final Studio Render
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </section>

          {/* Result Display */}
          <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 min-h-[500px] flex flex-col">
            <h2 className="flex items-center justify-between text-sm font-semibold mb-4 text-zinc-300">
              <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> 4. Final Render</span>
              {generatedImage && (
                <button 
                  onClick={() => clearImage('generated')}
                  className="text-[10px] text-zinc-500 hover:text-yellow-400 flex items-center gap-1.5 font-bold uppercase tracking-widest transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> New Shoot
                </button>
              )}
            </h2>
            
            <div className="flex-1 rounded-xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center relative group">
              {generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="Generated Result" 
                  className="w-full h-full object-contain"
                />
              ) : processing.isGeneratingImage ? (
                <div className="flex flex-col items-center gap-6 px-12 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-yellow-400/10 border-t-yellow-400 rounded-full animate-spin"></div>
                    <Camera className="absolute inset-0 m-auto w-8 h-8 text-yellow-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-black text-white tracking-tight uppercase">High Fidelity Rendering</p>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                      Precisely mapping the product onto the reference environment with pixel-accurate shadows and reflections.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-zinc-700">
                  <Layers className="w-16 h-16 opacity-10" />
                  <p className="text-xs font-medium uppercase tracking-[0.2em]">Awaiting Generation</p>
                </div>
              )}

              {processing.error && (
                <div className="absolute bottom-6 left-6 right-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs backdrop-blur-md">
                  <X className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold">{processing.error}</span>
                </div>
              )}
            </div>
            
            {generatedImage && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest border-r border-zinc-800 pr-4">
                    Render Specs
                  </div>
                  <div className="text-[10px] text-zinc-400 flex gap-3">
                    <span className="bg-zinc-800 px-2 py-1 rounded">RATIO {settings.aspectRatio}</span>
                    <span className="bg-zinc-800 px-2 py-1 rounded">{settings.lighting.toUpperCase()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedImage;
                    link.download = 'bananastudio-render.png';
                    link.click();
                  }}
                  className="w-full sm:w-auto px-6 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-black rounded-lg transition-all uppercase tracking-widest"
                >
                  Download Master PNG
                </button>
              </div>
            )}
          </section>

        </div>
      </main>

      <footer className="border-t border-zinc-900 py-8 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          <p>&copy; 2025 BananaStudio AI / Native Context Technology</p>
          <p className="text-zinc-800">Designed for professional aesthetic cloning</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
