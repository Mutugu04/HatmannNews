import React, { useState } from 'react';
import TerminalOutput from './TerminalOutput';
import { ProjectBlueprint } from '../types';

interface ScaffoldPanelProps {
  blueprint: ProjectBlueprint;
  onReset: () => void;
}

const ScaffoldPanel: React.FC<ScaffoldPanelProps> = ({ blueprint, onReset }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(blueprint.files[0]?.path || '');
  const [copied, setCopied] = useState(false);
  
  // Backend Install State
  const [isInstalling, setIsInstalling] = useState(false);
  const [installOutput, setInstallOutput] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  
  // Database Push State
  const [isPushing, setIsPushing] = useState(false);
  const [pushOutput, setPushOutput] = useState<string | null>(null);
  
  // Web Client Install State
  const [isWebInstalling, setIsWebInstalling] = useState(false);
  const [webInstallOutput, setWebInstallOutput] = useState<string | null>(null);
  const [isWebVerified, setIsWebVerified] = useState(false);

  // Server Boot State
  const [isBooting, setIsBooting] = useState(false);
  const [bootOutput, setBootOutput] = useState<string | null>(null);
  const [isServerUp, setIsServerUp] = useState(false);

  const selectedFile = blueprint.files.find(f => f.path === selectedFilePath);

  const handleCopy = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInstallSocket = () => {
    setIsInstalling(true);
    setInstallOutput('cd apps/api\npnpm add socket.io\n\nResolving dependencies...\nFetching packages from registry...\n+ socket.io 4.8.1\n+ @types/socket.io 3.0.2\n\n✔ Backend dependencies synchronized.');
    
    setTimeout(() => {
      setIsInstalling(false);
      setIsVerified(true);
    }, 1200);
  };

  const handleInstallWebClient = () => {
    setIsWebInstalling(true);
    setWebInstallOutput('cd apps/web\npnpm add socket.io-client\n\nAnalyzing web workspace...\nDownloading manifest...\n+ socket.io-client 4.8.1\n\n✔ Web client initialized.');
    
    setTimeout(() => {
      setIsWebInstalling(false);
      setIsWebVerified(true);
    }, 1200);
  };

  const handleDbPush = () => {
    setIsPushing(true);
    setPushOutput('Prisma schema loaded...\nAnalyzing database structure...\nPreparing migration for models: Show, Rundown, Story, Station...\nApplying changes...');
    
    setTimeout(() => {
      setPushOutput(prev => prev + '\n\n✔ Database is now in sync with your Prisma schema.\n✔ Generated Prisma Client to node_modules/.prisma/client');
      setIsPushing(false);
    }, 1800);
  };

  const handleBootServer = () => {
    setIsBooting(true);
    setBootOutput('node apps/api/src/index.ts\n\nInitializing HNMS Middleware (Helmet, CORS)...\nBootstrapping Socket.io layer...\nChecking PostgreSQL connection...');
    
    setTimeout(() => {
      setBootOutput(prev => prev + '\n\n🚀 API running at http://localhost:4000\n🕊️ WebSocket server ready');
      setIsBooting(false);
      setIsServerUp(true);
    }, 2000);
  };

  const rootFiles = blueprint.files.filter(f => !f.path.includes('/'));
  const appFiles = blueprint.files.filter(f => f.path.startsWith('apps/'));
  const packageFiles = blueprint.files.filter(f => f.path.startsWith('packages/'));

  const FileItem: React.FC<{ file: any }> = ({ file }) => (
    <button
      onClick={() => setSelectedFilePath(file.path)}
      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 group ${
        selectedFilePath === file.path 
          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
          : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 border border-transparent'
      }`}
    >
      <svg className={`w-3.5 h-3.5 ${selectedFilePath === file.path ? 'text-blue-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="truncate">{file.name}</span>
    </button>
  );

  const FolderSection = ({ title, files }: { title: string, files: any[] }) => {
    if (files.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 px-2 mb-1 opacity-50">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
        </div>
        <div className="pl-2 space-y-0.5">
          {files.map(f => <FileItem key={f.path} file={f} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
             <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{blueprint.projectName}</h2>
            <div className="flex gap-2 items-center">
               <span className="text-blue-500 text-[9px] font-black uppercase tracking-widest">Workspace Genesis</span>
               <div className="w-1 h-1 bg-slate-700 rounded-full" />
               <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">v1.2.0-REALTIME</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onReset}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase rounded-xl transition-all border border-slate-700 active:scale-95"
        >
          Exit Blueprint
        </button>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-3 bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sticky top-6">
          <FolderSection title="Applications" files={appFiles} />
          <FolderSection title="Packages" files={packageFiles} />
          <FolderSection title="Root" files={rootFiles} />
        </div>

        <div className="md:col-span-9 flex flex-col min-h-[500px] bg-[#020617] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between bg-slate-900/80 px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500" />
                   <span className="text-xs font-mono text-slate-300">{selectedFile.path}</span>
                </div>
                <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase border ${
                    copied ? 'text-green-400 bg-green-400/10 border-green-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
                  }`}
                >
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <div className="flex-grow p-0 overflow-auto font-mono text-sm max-h-[500px]">
                <div className="flex">
                  <div className="bg-[#020617] text-slate-700 text-right pr-4 pl-3 py-4 select-none border-r border-slate-800 min-w-[3rem]">
                    {selectedFile.content.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <div className="p-4 overflow-x-auto w-full">
                    <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedFile.content}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-12 text-slate-600 space-y-4">
              <p className="font-black uppercase tracking-[0.3em] text-xs">Select a source file for analysis</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Step 1: Backend Socket */}
        <div className="bg-emerald-600/10 border border-emerald-500/30 p-6 rounded-[2rem] flex flex-col gap-4">
           <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xl transition-all ${isVerified ? 'bg-emerald-600 shadow-emerald-500/40' : 'bg-slate-800'}`}>
              <svg className={`w-5 h-5 text-white ${isVerified ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
               <h4 className="text-white font-black uppercase text-[10px] tracking-tight">API Socket</h4>
               <p className="text-slate-500 text-[9px]">socket.io 4.8.1</p>
            </div>
          </div>
          <div className="space-y-3">
            <button 
              onClick={handleInstallSocket}
              disabled={isInstalling || isVerified}
              className={`w-full py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${isVerified ? 'bg-emerald-500 text-white cursor-default' : isInstalling ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
            >
              {isVerified ? '✔ API Ready' : isInstalling ? 'Installing...' : 'Install Socket'}
            </button>
            {installOutput && (
              <TerminalOutput command="pnpm add socket.io" output={installOutput} />
            )}
          </div>
        </div>

        {/* Step 2: Web Client Socket */}
        <div className="bg-sky-600/10 border border-sky-500/30 p-6 rounded-[2rem] flex flex-col gap-4">
           <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xl transition-all ${isWebVerified ? 'bg-sky-600 shadow-sky-500/40' : 'bg-slate-800'}`}>
              <svg className={`w-5 h-5 text-white ${isWebVerified ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            </div>
            <div>
               <h4 className="text-white font-black uppercase text-[10px] tracking-tight">Web Client</h4>
               <p className="text-slate-500 text-[9px]">socket.io-client</p>
            </div>
          </div>
          <div className="space-y-3">
            <button 
              onClick={handleInstallWebClient}
              disabled={isWebInstalling || isWebVerified}
              className={`w-full py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${isWebVerified ? 'bg-sky-500 text-white cursor-default' : isWebInstalling ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
            >
              {isWebVerified ? '✔ Client Sync' : isWebInstalling ? 'Installing...' : 'Sync Client'}
            </button>
            {webInstallOutput && (
              <TerminalOutput command="cd apps/web && pnpm add socket.io-client" output={webInstallOutput} />
            )}
          </div>
        </div>

        {/* Step 3: Schema Sync */}
        <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-[2rem] flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xl transition-all ${pushOutput ? 'bg-blue-600 shadow-blue-500/40' : 'bg-slate-800'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7" /></svg>
            </div>
            <div>
               <h4 className="text-white font-black uppercase text-[10px] tracking-tight">Prisma Sync</h4>
               <p className="text-slate-500 text-[9px]">PostgreSQL 14+</p>
            </div>
          </div>
          <div className="space-y-3">
            <button 
              onClick={handleDbPush}
              disabled={isPushing}
              className={`w-full py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${isPushing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
            >
              {isPushing ? 'Pushing...' : 'db:push'}
            </button>
            {pushOutput && (
              <TerminalOutput command="pnpm db:push" output={pushOutput} />
            )}
          </div>
        </div>

        {/* Step 4: Boot Server */}
        <div className="bg-primary-600/10 border border-primary-500/30 p-6 rounded-[2rem] flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xl transition-all ${isServerUp ? 'bg-primary-600 shadow-primary-500/40' : 'bg-slate-800'}`}>
              <svg className={`w-5 h-5 text-white ${isServerUp ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
               <h4 className="text-white font-black uppercase text-[10px] tracking-tight">Boot Cluster</h4>
               <p className="text-slate-500 text-[9px]">Express + Socket</p>
            </div>
          </div>
          <div className="space-y-3">
            <button 
              onClick={handleBootServer}
              disabled={isBooting || isServerUp}
              className={`w-full py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${isServerUp ? 'bg-primary-500 text-white cursor-default' : isBooting ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
            >
              {isServerUp ? '✔ Active' : isBooting ? 'Booting...' : 'Start Cluster'}
            </button>
            {bootOutput && (
              <TerminalOutput command="node apps/api/src/index.ts" output={bootOutput} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScaffoldPanel;