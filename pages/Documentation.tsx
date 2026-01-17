
import React, { useRef } from 'react';

export default function Documentation() {
  const docRef = useRef<HTMLDivElement>(null);

  const downloadWord = () => {
    if (!docRef.current) return;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>NewsVortex Master Guide</title><style>body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; } h1 { color: #0284c7; font-size: 24pt; border-bottom: 2pt solid #0284c7; padding-bottom: 10pt; } h2 { color: #0f172a; font-size: 18pt; margin-top: 20pt; border-left: 5pt solid #0284c7; padding-left: 10pt; } .section { margin-bottom: 25pt; } .stat-box { background: #f1f5f9; border: 1pt solid #cbd5e1; padding: 10pt; margin: 10pt 0; }</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + docRef.current.innerHTML + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileLink = document.createElement("a");
    document.body.appendChild(fileLink);
    fileLink.href = source;
    fileLink.download = 'HATMANN_NewsVortex_Master_Guide_v3.2.doc';
    fileLink.click();
    document.body.removeChild(fileLink);
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      {/* Utility Bar */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 print:hidden gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Master Intelligence Guide</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Unified Operations Aggregate • v3.2.0-STABLE</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={downloadPDF}
            className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Generate PDF Report
          </button>
          <button 
            onClick={downloadWord}
            className="px-8 py-4 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary-500 transition-all flex items-center gap-2 shadow-xl shadow-primary-600/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Export MS Word (.doc)
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div ref={docRef} className="bg-white p-12 md:p-24 rounded-[4rem] shadow-2xl border border-slate-100 print:shadow-none print:border-none print:p-0 text-slate-800">
        
        {/* COVER PAGE (Simulated for Print) */}
        <div className="min-h-[700px] flex flex-col justify-center border-b-[12px] border-primary-600 mb-20 pb-20 page-break-after">
           <div className="mb-12">
             <div className="w-24 h-24 bg-primary-600 rounded-[2rem] flex items-center justify-center mb-10 shadow-3xl shadow-primary-600/30">
               <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
             </div>
             <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] mb-6">HATMANN<br/><span className="text-primary-600">NewsVortex</span></h1>
             <div className="h-2 w-48 bg-slate-900 rounded-full mb-10"></div>
             <p className="text-2xl font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Complete Operations & Operating Guide</p>
             <p className="text-lg font-bold text-slate-500">The Dynamic News Management Solution for Multi-Station Networks</p>
           </div>
           
           <div className="mt-auto grid grid-cols-2 gap-10">
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">VERSION</p>
               <p className="text-sm font-black text-slate-900 uppercase">3.2.0 • Aggregated Release</p>
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DATE</p>
               <p className="text-sm font-black text-slate-900 uppercase">January 2026</p>
             </div>
             <div className="col-span-2 pt-10 border-t border-slate-100">
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">© 2026 Hatmann Nigeria Limited | Professional Broadcast Intelligence</p>
             </div>
           </div>
        </div>

        {/* 01. EXECUTIVE SUMMARY */}
        <section className="mb-24 section">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-4">
             <span className="text-primary-600 text-lg">01.</span> Executive Summary
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-xl leading-relaxed mb-8 font-medium text-slate-600">
              HATMANN NewsVortex represents the next generation of broadcast news management technology, specifically designed for multi-station radio networks operating in dynamic African markets. 
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 stat-box">
                  <div className="text-3xl font-black text-primary-600 mb-1">40%</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reduction in Production Time</div>
               </div>
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 stat-box">
                  <div className="text-3xl font-black text-primary-600 mb-1">60%</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Improvement in Coordination</div>
               </div>
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 stat-box">
                  <div className="text-3xl font-black text-primary-600 mb-1">37M+</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Listeners Managed</div>
               </div>
            </div>
            <p className="text-slate-600 leading-relaxed">
              By seamlessly integrating traditional radio workflows with cutting-edge digital capabilities, NewsVortex addresses content fragmentation across multiple frequencies. It ensures editorial standards are maintained across distributed teams through automated synchronization and real-time collaboration.
            </p>
          </div>
        </section>

        {/* 02. SYSTEM ARCHITECTURE & STATION NETWORK */}
        <section className="mb-24 section">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-4">
             <span className="text-primary-600 text-lg">02.</span> Station Network Intelligence
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-6">
              The NewsVortex cluster operates as a decentralized intelligence node. Each station in the Freedom Radio Group is an integral part of this network, sharing a unified database while maintaining localized broadcast control.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
               <div className="p-6 border-2 border-slate-50 rounded-3xl">
                  <h4 className="font-black text-slate-900 uppercase text-xs mb-4">Core Frequency Cluster</h4>
                  <ul className="space-y-3">
                    <li className="flex justify-between text-sm font-bold"><span className="text-slate-400 uppercase tracking-widest text-[10px]">Station 01:</span> <span>Freedom Radio Kano (99.5 FM)</span></li>
                    <li className="flex justify-between text-sm font-bold"><span className="text-slate-400 uppercase tracking-widest text-[10px]">Station 02:</span> <span>Freedom Radio Dutse (99.5 FM)</span></li>
                    <li className="flex justify-between text-sm font-bold"><span className="text-slate-400 uppercase tracking-widest text-[10px]">Station 03:</span> <span>Freedom Radio Kaduna (92.9 FM)</span></li>
                    <li className="flex justify-between text-sm font-bold border-t border-slate-50 pt-3 text-primary-600"><span className="uppercase tracking-widest text-[10px]">Station 04:</span> <span>Dala FM 88.5 Kano</span></li>
                  </ul>
               </div>
               <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white">
                  <h4 className="font-black text-primary-400 uppercase text-[10px] tracking-widest mb-4">Dynamic Expansion Engine</h4>
                  <p className="text-xs leading-relaxed text-slate-400">
                    The NewsVortex architecture supports unlimited station expansion. Via <strong>Settings &gt; Stations</strong>, administrators can initialize new nodes. Each new node automatically inherits all RBAC privileges and historical archive access.
                  </p>
               </div>
            </div>
          </div>
        </section>

        {/* 03. USER ROLES & PERMISSIONS */}
        <section className="mb-24 section">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-4">
             <span className="text-primary-600 text-lg">03.</span> Access & Identity Management
          </h2>
          <div className="overflow-hidden rounded-[2rem] border border-slate-100 mb-8">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Operational Role</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Responsibility</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Key Privilege</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-6 py-4 font-black text-slate-900 text-sm">Journalist</td><td className="px-6 py-4 text-sm text-slate-500">Content Creation & Interviews</td><td className="px-6 py-4 text-xs font-bold text-primary-600">Rich Text Narrative Authoring</td></tr>
                <tr><td className="px-6 py-4 font-black text-slate-900 text-sm">Editor</td><td className="px-6 py-4 text-sm text-slate-500">Content Review & Scheduling</td><td className="px-6 py-4 text-xs font-bold text-primary-600">Multi-Channel Approval</td></tr>
                <tr><td className="px-6 py-4 font-black text-slate-900 text-sm">Producer</td><td className="px-6 py-4 text-sm text-slate-500">Show Planning & Rundowns</td><td className="px-6 py-4 text-xs font-bold text-primary-600">Production Sequence Master</td></tr>
                <tr><td className="px-6 py-4 font-black text-slate-900 text-sm">Technical</td><td className="px-6 py-4 text-sm text-slate-500">Maintenance & Integration</td><td className="px-6 py-4 text-xs font-bold text-primary-600">Sentinel Diagnostic Hub</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 04. MODULE DEEP-DIVE */}
        <section className="mb-24 section">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-4">
             <span className="text-primary-600 text-lg">04.</span> Operational Core Modules
          </h2>
          
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-slate-900"></div>
                Newsroom Management (Archives)
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                The <strong>Editorial Workflow</strong> streamlines process from assignment to broadcast. The <strong>Story Editor</strong> utilizes the TipTap narrative engine, featuring Semantic Formatting (H2/H3), Blockquotes, and Highlight markers.
              </p>
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                 <h5 className="font-black text-blue-900 uppercase text-[10px] tracking-widest mb-2">Presence Widget Intelligence</h5>
                 <p className="text-xs text-blue-700">Real-time collaboration prevents narrative collision. Live indicators show precisely who is editing which archive in real-time via WebSocket synchronization.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-slate-900"></div>
                Production & Rundown Orchestration
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Producers define show slots (e.g. Morning Intelligence Report) and schedule broadcast instances. The <strong>Rundown Editor</strong> sequences Segments: Story, Break, Live, Interview, Promo, Music, and Ad.
              </p>
              <ul className="list-disc pl-10 text-sm text-slate-500 space-y-2">
                <li>Automated total duration calculation</li>
                <li>Socket-sync state for live control room monitoring</li>
                <li>Linked Narrative synchronization with the Story Archive</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-slate-900"></div>
                Global Wire Intelligence
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Connect directly to Reuters, AP, and NewsVortex Proprietary feeds. Items can be imported directly into the editorial archive with a single click, preserving meta-data and sourcing information.
              </p>
            </div>
          </div>
        </section>

        {/* 05. SENTINEL AI DIAGNOSTICS */}
        <section className="mb-24 section">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-4">
             <span className="text-primary-600 text-lg">05.</span> Diagnostic Sentinel & AI Vision
          </h2>
          <div className="bg-slate-950 text-white p-12 rounded-[3.5rem] shadow-3xl relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-primary-400 font-black uppercase tracking-[0.4em] text-[10px] mb-6">Advanced Engineering Protocol</p>
                <h3 className="text-4xl font-black tracking-tighter uppercase mb-6">Vision Detection System</h3>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  The Sentinel Node ensures cluster health by analyzing the underlying infrastructure stack (Node.js, PostgreSQL, Redis).
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="p-6 border border-white/10 rounded-3xl bg-white/5">
                      <h4 className="font-black text-sm text-white mb-3 uppercase tracking-widest">Image Analysis</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Upload screenshots of system logs or terminal outputs. The AI Vision layer detects version mismatches and runtime errors instantly.</p>
                   </div>
                   <div className="p-6 border border-white/10 rounded-3xl bg-white/5">
                      <h4 className="font-black text-sm text-white mb-3 uppercase tracking-widest">Blueprint Generation</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Request new architecture modules. Sentinel generates full-stack monorepo blueprints including Prisma schemas and API routes.</p>
                   </div>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px]"></div>
          </div>
        </section>

        {/* 06. TROUBLESHOOTING & SUPPORT */}
        <section className="mb-24 section">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-4">
             <span className="text-primary-600 text-lg">06.</span> Troubleshooting & Continuity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl">
                   <h4 className="font-black text-slate-900 uppercase text-xs mb-2">Access Issues</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">Ensure browser cache is cleared. Verify JWT token persistence in local storage. Use "Forgot Password" to trigger a secure credential reset.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl">
                   <h4 className="font-black text-slate-900 uppercase text-xs mb-2">Sync Latency</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">Check the "Socket Sync" indicator in the Rundown Editor. If grey, refresh the page to re-establish the primary WebSocket handshake.</p>
                </div>
             </div>
             <div className="p-8 border-2 border-primary-50 rounded-[2.5rem] flex flex-col justify-center text-center">
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4">Contacting Support</p>
                <p className="text-xl font-black text-slate-900 mb-2 tracking-tight">Abbas M. Dalhatu</p>
                <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-widest">Chief Executive Officer</p>
                <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs font-black uppercase tracking-widest">
                   support@hatmannng.com
                </div>
             </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
          <span>HATMANN GLOBAL BROADCAST SYSTEMS</span>
          <span>PAGE 01 — END OF CORE GUIDE</span>
        </div>

      </div>
    </div>
  );
}
