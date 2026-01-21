
import React, { useRef } from 'react';

export default function Documentation() {
  const docRef = useRef<HTMLDivElement>(null);

  const downloadWord = () => {
    if (!docRef.current) return;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>NewsVortex Master Guide</title><style>body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #334155; } h1 { color: #0284c7; font-size: 28pt; border-bottom: 3pt solid #0284c7; padding-bottom: 12pt; margin-top: 40pt; } h2 { color: #0f172a; font-size: 20pt; margin-top: 30pt; border-left: 6pt solid #0284c7; padding-left: 15pt; } h3 { color: #1e293b; font-size: 16pt; margin-top: 20pt; } .section { margin-bottom: 35pt; } .stat-box { background: #f8fafc; border: 1pt solid #e2e8f0; padding: 15pt; margin: 15pt 0; border-radius: 10pt; } .status-badge { font-weight: bold; text-transform: uppercase; font-size: 9pt; padding: 3pt 8pt; border-radius: 4pt; }</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + docRef.current.innerHTML + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileLink = document.createElement("a");
    document.body.appendChild(fileLink);
    fileLink.href = source;
    fileLink.download = 'HATMANN_NewsVortex_Comprehensive_Manual_v3.5.doc';
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Global Operations Manual</h1>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">Comprehensive System Intelligence Aggregate • v3.5.0</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={downloadPDF}
            className="px-8 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            PDF Manual
          </button>
          <button
            onClick={downloadWord}
            className="px-8 py-4 bg-primary-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary-500 transition-all flex items-center gap-2 shadow-xl shadow-primary-600/20 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Word Export
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div ref={docRef} className="bg-white p-12 md:p-24 rounded-[4rem] shadow-2xl border border-slate-100 print:shadow-none print:border-none print:p-0 text-slate-800">
        
        {/* COVER PAGE */}
        <div className="min-h-[800px] flex flex-col justify-center border-b-[16px] border-primary-600 mb-24 pb-24 page-break-after">
           <div className="mb-16">
             <div className="w-32 h-32 bg-primary-600 rounded-[2.5rem] flex items-center justify-center mb-12 shadow-3xl shadow-primary-600/30">
               <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
             </div>
             <h1 className="text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8] mb-8">HATMANN<br/><span className="text-primary-600">NewsVortex</span></h1>
             <div className="h-3 w-64 bg-slate-900 rounded-full mb-12"></div>
             <p className="text-3xl font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Master Protocol & Operations Manual</p>
             <p className="text-xl font-bold text-slate-500 max-w-2xl">The Complete Functional Blueprint for Professional Multi-Station Newsroom Orchestration.</p>
           </div>
           
           <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-12">
             <div>
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">SYSTEM VERSION</p>
               <p className="text-sm font-black text-slate-900 uppercase">3.5.0-STABLE</p>
             </div>
             <div>
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">AUTHORED BY</p>
               <p className="text-sm font-black text-slate-900 uppercase">HATMANN Engineering</p>
             </div>
             <div>
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">DEPLOYMENT</p>
               <p className="text-sm font-black text-slate-900 uppercase">Multi-Cluster</p>
             </div>
             <div>
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">DATE</p>
               <p className="text-sm font-black text-slate-900 uppercase">February 2026</p>
             </div>
           </div>
        </div>

        {/* 01. CORE CONCEPT */}
        <section className="mb-24 section">
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-6">
             <span className="text-primary-600 text-2xl">01.</span> The NewsVortex Ecosystem
          </h2>
          <div className="prose prose-slate max-w-none text-lg leading-relaxed text-slate-600 space-y-8">
            <p>
              HATMANN NewsVortex is a decentralized, real-time news management system. Unlike traditional spreadsheets, NewsVortex treats every story as a <strong>Narrative Intelligence Node</strong> that flows through a strictly enforced editorial pipeline.
            </p>
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
               <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-6">Key Philosophical Pillars:</h4>
               <ul className="grid md:grid-cols-2 gap-8 list-none p-0">
                  <li className="flex gap-4">
                     <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 font-black text-xs">1</span>
                     <div>
                        <p className="font-black text-slate-900 uppercase text-xs mb-1">Unified Archive</p>
                        <p className="text-sm">Every journalist across the station network contributes to a single, searchable narrative database.</p>
                     </div>
                  </li>
                  <li className="flex gap-4">
                     <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 font-black text-xs">2</span>
                     <div>
                        <p className="font-black text-slate-900 uppercase text-xs mb-1">Station Autonomy</p>
                        <p className="text-sm">Stations manage their own localized broadcast instances while sharing global intelligence.</p>
                     </div>
                  </li>
                  <li className="flex gap-4">
                     <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 font-black text-xs">3</span>
                     <div>
                        <p className="font-black text-slate-900 uppercase text-xs mb-1">Real-time Presence</p>
                        <p className="text-sm">Conflict-free editing ensures that no two journalists can overwrite the same story simultaneously.</p>
                     </div>
                  </li>
                  <li className="flex gap-4">
                     <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 font-black text-xs">4</span>
                     <div>
                        <p className="font-black text-slate-900 uppercase text-xs mb-1">Auditability</p>
                        <p className="text-sm">Every status change and broadcast log is stamped with high-fidelity temporal metadata.</p>
                     </div>
                  </li>
               </ul>
            </div>
          </div>
        </section>

        {/* 02. EDITORIAL PIPELINE */}
        <section className="mb-24 section">
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-6">
             <span className="text-primary-600 text-2xl">02.</span> The Editorial Pipeline
          </h2>
          <div className="space-y-12">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">Status Definitions & Protocols</h3>
               <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                     <span className="text-xs font-black text-slate-600 uppercase mb-2 block">DRAFT</span>
                     <p className="text-xs leading-relaxed">Story is under construction. Only visible to author and editors.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                     <span className="text-xs font-black text-amber-700 uppercase mb-2 block">PENDING</span>
                     <p className="text-xs leading-relaxed">Submitted for review. Appears in the Centre Hub for editorial action.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                     <span className="text-xs font-black text-emerald-700 uppercase mb-2 block">APPROVED</span>
                     <p className="text-xs leading-relaxed">Verified by an Editor. Ready to be inserted into a broadcast Rundown.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                     <span className="text-xs font-black text-blue-700 uppercase mb-2 block">PUBLISHED</span>
                     <p className="text-xs leading-relaxed">Active in a Rundown or broadcast. Finalized state for record-keeping.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                     <span className="text-xs font-black text-rose-700 uppercase mb-2 block">KILLED</span>
                     <p className="text-xs leading-relaxed">Rejected story. Preserved in archive but blocked from broadcast.</p>
                  </div>
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Story Authoring Features</h4>
                  <ul className="space-y-4">
                     <li className="flex gap-4 items-start">
                        <div className="w-2 h-2 rounded-full bg-primary-600 mt-1.5"></div>
                        <p className="text-sm"><strong>Rich Text (TipTap):</strong> Supports H2, H3, Bold, Lists, and Semantic Highlighting.</p>
                     </li>
                     <li className="flex gap-4 items-start">
                        <div className="w-2 h-2 rounded-full bg-primary-600 mt-1.5"></div>
                        <p className="text-sm"><strong>Word Count Analytics:</strong> Live progress tracking relative to typical news slot durations.</p>
                     </li>
                     <li className="flex gap-4 items-start">
                        <div className="w-2 h-2 rounded-full bg-primary-600 mt-1.5"></div>
                        <p className="text-sm"><strong>Priority Escalation:</strong> Assign Normal, High, or Urgent priority to alert the newsroom.</p>
                     </li>
                  </ul>
               </div>
               <div className="bg-slate-900 text-white p-8 rounded-[2.5rem]">
                  <h4 className="text-xs font-black text-primary-400 uppercase tracking-[0.4em] mb-4">Protocol: Collaboration</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                     When opening a story, the <strong>Presence Widget</strong> monitors active sockets. If another user joins, their initials will appear in the header. Editing locks are managed automatically to prevent narrative divergence.
                  </p>
               </div>
            </div>
          </div>
        </section>

        {/* 03. PRODUCTION HUB */}
        <section className="mb-24 section">
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-6">
             <span className="text-primary-600 text-2xl">03.</span> The Management Terminal
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
            <p>
               The <strong>Centre Production Hub</strong> serves as the central nervous system for News Directors and Editors-in-Chief. It aggregates metrics across the entire station node.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
               <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-center">
                  <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-2">Narrative Approval</h5>
                  <p className="text-xs">One-click approval or rejection of stories submitted by journalists.</p>
               </div>
               <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-center">
                  <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-2">Production Health</h5>
                  <p className="text-xs">Monitor socket handshakes and database latency in real-time.</p>
               </div>
               <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-center">
                  <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-2">Cluster Metrics</h5>
                  <p className="text-xs">Visual breakdown of draft volume vs. broadcast readiness.</p>
               </div>
            </div>
          </div>
        </section>

        {/* 04. RUNDOWN ORCHESTRATION */}
        <section className="mb-24 section">
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-6">
             <span className="text-primary-600 text-2xl">04.</span> Production & Rundowns
          </h2>
          <div className="bg-slate-50 rounded-[3rem] border border-slate-100 p-12">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-8">Rundown Editor Protocol</h3>
            <p className="text-slate-600 mb-8">
               Rundowns are the final sequence of segments to be broadcast. They are created under "Shows" and are tied to a specific date and time.
            </p>
            <div className="grid md:grid-cols-2 gap-12">
               <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Segment Types</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between text-xs font-bold py-2 border-b border-slate-100"><span>STORY</span> <span className="text-blue-700">Linked to Editorial Archive</span></div>
                     <div className="flex justify-between text-xs font-bold py-2 border-b border-slate-100"><span>BREAK</span> <span className="text-slate-600">Station/Commercial Break</span></div>
                     <div className="flex justify-between text-xs font-bold py-2 border-b border-slate-100"><span>LIVE</span> <span className="text-rose-700">Outside Broadcast Link</span></div>
                     <div className="flex justify-between text-xs font-bold py-2 border-b border-slate-100"><span>INTERVIEW</span> <span className="text-purple-700">In-Studio Guest Segment</span></div>
                     <div className="flex justify-between text-xs font-bold py-2 border-b border-slate-100"><span>PROMO / AD</span> <span className="text-amber-700">Commercial / Marketing</span></div>
                  </div>
               </div>
               <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Timing Intelligence</h4>
                  <p className="text-xs leading-relaxed text-slate-500 mb-4">
                     The Rundown Editor automatically calculates the <strong>Total Planned Duration</strong>. Producers must ensure the total duration matches the allocated show slot (e.g., 60 minutes).
                  </p>
                  <div className="p-6 bg-slate-900 rounded-3xl text-white">
                     <p className="text-xs font-black text-primary-400 uppercase tracking-widest mb-2">Automation Tip:</p>
                     <p className="text-xs italic text-slate-300">Segments can be deleted and re-ordered in real-time, with global updates synced to all control room terminals.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* 05. WIRE INTELLIGENCE */}
        <section className="mb-24 section">
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-6">
             <span className="text-primary-600 text-2xl">05.</span> Global Wire Intelligence
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
            <p>
               NewsVortex integrates with external providers (Reuters, AP, NewsVortex Direct) to provide a constant stream of raw intelligence. 
            </p>
            <div className="bg-blue-50 p-10 rounded-[3rem] border border-blue-100">
               <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4">Import Protocol</h4>
               <ol className="text-xs space-y-3 font-bold text-blue-800">
                  <li>Navigate to Wire Feeds.</li>
                  <li>Filter by Agency (Source Channel).</li>
                  <li>Click "Refresh All Channels" to force a satellite fetch.</li>
                  <li>Click "Import to Archive" on a wire item to convert it into a NewsVortex Story.</li>
               </ol>
            </div>
          </div>
        </section>

        {/* 06. SETTINGS & ADMINISTRATION */}
        <section className="mb-24 section">
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-6">
             <span className="text-primary-600 text-2xl">06.</span> Network Administration
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="p-10 border-2 border-slate-50 rounded-[3rem]">
               <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Station Node Initialization</h4>
               <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Administrators can create new stations via <strong>Settings &gt; Stations</strong>. Each station requires:
               </p>
               <ul className="text-xs font-black space-y-2 uppercase">
                  <li>• Formal Name</li>
                  <li>• Unique Call Sign (e.g. FRKANO)</li>
                  <li>• Frequency & City Metadata</li>
               </ul>
            </div>
            <div className="p-10 bg-slate-900 text-white rounded-[3rem]">
               <h4 className="text-xs font-black text-primary-400 uppercase tracking-widest mb-6">Integration Suite</h4>
               <p className="text-xs text-slate-300 leading-relaxed">
                  Manage API keys and feed URLs for Wire Services. The system supports native RSS and custom JSON endpoints for professional news agency synchronization.
               </p>
            </div>
          </div>
        </section>

        {/* 07. TECHNICAL SUPPORT */}
        <section className="mb-24 section">
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-6">
             <span className="text-primary-600 text-2xl">07.</span> Continuity & Support
          </h2>
          <div className="bg-slate-50 p-12 rounded-[4rem]">
             <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="max-w-md">
                   <h4 className="text-xl font-black text-slate-900 mb-4">System Uptime Protocol</h4>
                   <p className="text-sm text-slate-500 leading-relaxed">
                      If the global status bar indicates a "lost signal," check your node's internet connectivity and re-verify the Supabase handshake. The NewsVortex is designed to cache local changes for up to 30 seconds before requiring a primary cluster sync.
                   </p>
                </div>
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center shrink-0">
                   <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-2">Technical Inquiries</p>
                   <p className="text-lg font-black text-slate-900">Abbas M. Dalhatu</p>
                   <p className="text-xs font-bold text-slate-500 uppercase mb-6">System Architect</p>
                   <div className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">support@hatmannng.com</div>
                </div>
             </div>
          </div>
        </section>

        {/* DOCUMENT FOOTER */}
        <div className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-black text-slate-500 uppercase tracking-[0.5em]">
          <div className="flex items-center gap-4">
             <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
             <span>HATMANN GLOBAL BROADCAST SYSTEMS</span>
          </div>
          <span>© 2026 NEWSVORTEX PRO PRIETARY</span>
          <span>MASTER GUIDE END — v3.5</span>
        </div>

      </div>
    </div>
  );
}
