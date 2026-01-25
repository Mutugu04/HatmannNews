
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { parseNodeVersion, parseNpmVersion, parsePnpmVersion, parsePgVersion, parseRedisVersion, compareVersions, fileToBase64 } from '../services/utils';
import { MIN_NODE_VERSION, MIN_NPM_VERSION, MIN_PNPM_VERSION, MIN_PG_VERSION, MIN_REDIS_VERSION, NEWSVORTEX_TEMPLATE } from '../constants';
import { DiagnosticResult, ProjectBlueprint } from '../types';

interface DiagnosticPanelProps {
  onComplete: (result: DiagnosticResult) => void;
  onScaffoldRequested: (blueprint: ProjectBlueprint) => void;
}

const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ onComplete, onScaffoldRequested }) => {
  const [nodeInput, setNodeInput] = useState('');
  const [npmInput, setNpmInput] = useState('');
  const [pnpmInput, setPnpmInput] = useState('');
  const [pgVersionInput, setPgVersionInput] = useState('');
  const [pgIsRunning, setPgIsRunning] = useState<boolean>(false);
  const [redisVersionInput, setRedisVersionInput] = useState('');
  const [redisIsRunning, setRedisIsRunning] = useState<boolean>(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheck = () => {
    const nodeVer = parseNodeVersion(nodeInput);
    const npmVer = parseNpmVersion(npmInput);
    const pnpmVer = parsePnpmVersion(pnpmInput);
    const pgVer = parsePgVersion(pgVersionInput);
    const redisVer = parseRedisVersion(redisVersionInput);

    const nodeValid = compareVersions(nodeVer, MIN_NODE_VERSION);
    const npmValid = compareVersions(npmVer, MIN_NPM_VERSION);
    const pnpmValid = compareVersions(pnpmVer, MIN_PNPM_VERSION);
    const pgValid = compareVersions(pgVer, MIN_PG_VERSION);
    const redisValid = compareVersions(redisVer, MIN_REDIS_VERSION);

    const errors: string[] = [];
    if (!nodeVer) errors.push("Node.js is missing.");
    if (!npmVer) errors.push("npm is missing.");
    if (!pnpmVer) errors.push("pnpm is missing.");
    if (!pgVer) errors.push("PostgreSQL is missing.");
    if (!redisVer) errors.push("Redis is missing.");

    onComplete({
      isHealthy: nodeValid && npmValid && pnpmValid && pgValid && pgIsRunning && redisValid && redisIsRunning,
      nodeVersion: nodeVer,
      npmVersion: npmVer,
      pnpmVersion: pnpmVer,
      pgVersion: pgVer,
      pgIsRunning,
      redisVersion: redisVer,
      redisIsRunning,
      errors
    });
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(file);
      // Initialize GoogleGenAI client right before use to ensure the latest API key is used.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        // Using 'gemini-3-pro-preview' for complex text and coding tasks involving project blueprint generation.
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            },
            {
              text: `Analyze this image. It contains either:
              1. A system runtime diagnostic (Node, pnpm, etc.).
              2. A Project Scaffolding initialization for HATMANN NewsVortex.
              3. A Web App UI architectural request.

              If it's #2 or #3:
              - Return a PROJECT BLUEPRINT JSON.
              - For Prompt 26 (Dashboard UI & Auth Integration):
                * File: 'apps/web/src/pages/Dashboard.tsx'.
                * UI: Header with 'bg-primary-700' background and white text.
                * Layout: Centered container for main content with 'bg-white rounded-lg shadow'.
                * Features: Display 'Welcome, {user.firstName}', show 'User: {user.email}'.
                * Interactions: Header button calls 'logout' from 'useAuth'.
                * Refinement: Ensure 'apps/web/src/App.tsx' imports 'Dashboard' and 'Login' as default exports.
              - Consistency Rule: Retain the full monorepo architecture for NewsVortex. Ensure database packages (Prisma) and backend API (Express/Auth) are preserved in the blueprint.
              - Return the FULL content of all project files to maintain workspace integrity.
              
              Precision is mandatory. If diagnostic, leave blueprint null.`,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nodeVersion: { type: Type.STRING, nullable: true },
              npmVersion: { type: Type.STRING, nullable: true },
              pnpmVersion: { type: Type.STRING, nullable: true },
              pgVersion: { type: Type.STRING, nullable: true },
              pgIsRunning: { type: Type.BOOLEAN },
              redisVersion: { type: Type.STRING, nullable: true },
              redisIsRunning: { type: Type.BOOLEAN },
              blueprint: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  projectName: { type: Type.STRING },
                  structure: { type: Type.STRING },
                  files: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        path: { type: Type.STRING },
                        content: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            required: ["nodeVersion", "npmVersion", "pnpmVersion", "pgVersion", "pgIsRunning", "redisVersion", "redisIsRunning"],
          },
        },
      });

      // Directly access .text property from GenerateContentResponse as per guidelines.
      const result = JSON.parse(response.text || '{}');
      
      if (result.blueprint) {
        onScaffoldRequested(result.blueprint);
      } else {
        if (result.nodeVersion) setNodeInput(result.nodeVersion);
        if (result.npmVersion) setNpmInput(result.npmVersion);
        if (result.pnpmVersion) setPnpmInput(result.pnpmVersion);
        if (result.pgVersion) setPgVersionInput(result.pgVersion);
        setPgIsRunning(result.pgIsRunning);
        if (result.redisVersion) setRedisVersionInput(result.redisVersion);
        setRedisIsRunning(result.redisIsRunning);
        
        if (!result.nodeVersion && !result.npmVersion && !result.pnpmVersion && !result.pgVersion && !result.redisVersion) {
          setError("Detection failed. Please provide a clear screenshot or prompt.");
        }
      }
    } catch (err) {
      setError("AI Analysis failed. Check API configuration.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-white uppercase tracking-tighter">Sentinel Input</h3>
          <div className="flex gap-2">
             <button 
              onClick={() => onScaffoldRequested(NEWSVORTEX_TEMPLATE)}
              className="text-[9px] px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30 font-black uppercase hover:bg-indigo-500/30 transition-all"
             >
               NewsVortex Template
             </button>
             <span className="text-[9px] px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 font-black uppercase">
               Vision 3.2
             </span>
          </div>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative mb-8 border-2 border-dashed rounded-[2rem] p-10 transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden
            ${isProcessing ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80'}`}
        >
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processImage(e.target.files[0])} accept="image/*" className="hidden" />
          
          {isProcessing ? (
             <div className="flex flex-col items-center py-4 relative z-10">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(99,102,241,0.4)]" />
                <p className="text-indigo-400 text-sm font-black uppercase tracking-widest animate-pulse">Analyzing Target...</p>
             </div>
          ) : (
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors shadow-xl">
                 <svg className="w-8 h-8 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <p className="text-slate-200 text-sm font-bold uppercase tracking-widest mb-1">Vision Detection</p>
              <p className="text-slate-500 text-[10px] font-medium">Logs, RBAC Architecture, or Prisma Schemas</p>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent h-[10%] w-full animate-[scan_1.5s_infinite] pointer-events-none" />
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Node.js</label>
            <input type="text" value={nodeInput} onChange={(e) => setNodeInput(e.target.value)} placeholder="v18+" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500/50 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">npm</label>
            <input type="text" value={npmInput} onChange={(e) => setNpmInput(e.target.value)} placeholder="9+" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500/50 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">pnpm</label>
            <input type="text" value={pnpmInput} onChange={(e) => setPnpmInput(e.target.value)} placeholder="8+" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500/50 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">PostgreSQL</label>
            <input type="text" value={pgVersionInput} onChange={(e) => setPgVersionInput(e.target.value)} placeholder="14+" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500/50 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Redis</label>
            <input type="text" value={redisVersionInput} onChange={(e) => setRedisVersionInput(e.target.value)} placeholder="6+" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500/50 outline-none" />
          </div>
          
          <div className="md:col-span-1 grid grid-cols-1 gap-1.5 mt-auto">
            <button 
              onClick={() => setPgIsRunning(!pgIsRunning)}
              className={`h-9 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${pgIsRunning ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
            >
              PG: {pgIsRunning ? 'Online' : 'Offline'}
            </button>
            <button 
              onClick={() => setRedisIsRunning(!redisIsRunning)}
              className={`h-9 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${redisIsRunning ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
            >
              Redis: {redisIsRunning ? 'Online' : 'Offline'}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleCheck}
        disabled={isProcessing}
        className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-[0.2em] text-sm shadow-2xl transition-all ${isProcessing ? 'bg-slate-800 opacity-50' : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-blue-500/20'}`}
      >
        Execute System Validation
      </button>

      {error && <p className="text-center text-red-400 text-[10px] font-black uppercase tracking-widest animate-bounce">{error}</p>}

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default DiagnosticPanel;
