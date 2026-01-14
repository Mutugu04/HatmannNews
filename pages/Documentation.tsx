import React, { useRef } from 'react';

export default function Documentation() {
  const docRef = useRef<HTMLDivElement>(null);

  const downloadWord = () => {
    if (!docRef.current) return;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>NewsVortex Manual</title><style>body { font-family: sans-serif; } h1 { color: #0284c7; } .section { margin-bottom: 20px; }</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + docRef.current.innerHTML + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileLink = document.createElement("a");
    document.body.appendChild(fileLink);
    fileLink.href = source;
    fileLink.download = 'HATMANN_NewsVortex_Manual.doc';
    fileLink.click();
    document.body.removeChild(fileLink);
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Utilities Header */}
      <div className="mb-10 flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">System Intelligence Manual</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HATMANN NewsVortex Documentation v3.2</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={downloadPDF}
            className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export PDF
          </button>
          <button 
            onClick={downloadWord}
            className="px-6 py-3 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary-500 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export Word (.doc)
          </button>
        </div>
      </div>

      {/* Manual Content */}
      <div ref={docRef} className="bg-white p-12 md:p-20 rounded-[3rem] shadow-2xl border border-slate-100 print:shadow-none print:border-none print:p-0">
        
        {/* Cover Section */}
        <div className="border-b-4 border-primary-600 pb-10 mb-16 text-center md:text-left">
           <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
             <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
             </div>
             <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">HATMANN<br/><span className="text-primary-600">NewsVortex</span></h1>
           </div>
           <p className="text-xl font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Official Operations Manual</p>
           <p className="text-sm font-medium text-slate-400">Version 3.2.0 • Real-time Broadcast Intelligence Cluster</p>
        </div>

        {/* Introduction */}
        <section className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 border-l-4 border-primary-600 pl-6">01. Overview</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            The <strong>HATMANN NewsVortex</strong> is a centralized, real-time news management and broadcast orchestration system. Designed for enterprise-grade newsrooms, it synchronizes editorial streams, wire intelligence, and production rundowns across global station nodes.
          </p>
          <p className="text-slate-600 leading-relaxed">
            This manual provides an exhaustive guide to accessing and utilizing the NewsVortex engine for journalists, editors, and broadcast engineers.
          </p>
        </section>

        {/* Authentication & Access */}
        <section className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 border-l-4 border-primary-600 pl-6">02. Access Control</h2>
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h3 className="font-black text-slate-900 uppercase text-sm mb-3">Authentication Protocol</h3>
              <p className="text-sm text-slate-600 mb-4">Users must authenticate via the NewsVortex Login Gateway using secure credentials. The system employs JWT (JSON Web Token) technology to maintain session persistence.</p>
              <ul className="list-disc pl-6 text-sm text-slate-500 space-y-1">
                <li><strong>Gateway:</strong> /login</li>
                <li><strong>Demo Access:</strong> test@example.com / password123</li>
              </ul>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h3 className="font-black text-slate-900 uppercase text-sm mb-3">Station Context Selection</h3>
              <p className="text-sm text-slate-600">Upon successful authentication, users must select a broadcast station (e.g., Freedom Radio Kano, Dutse, or Kaduna) from the global header. This initializes the localized intelligence node and filtering rules.</p>
            </div>
          </div>
        </section>

        {/* Dashboard Intelligence */}
        <section className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 border-l-4 border-primary-600 pl-6">03. Dashboard Intelligence</h2>
          <p className="text-slate-600 mb-6">The primary dashboard serves as the nerve center for current system status and immediate editorial streams.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="border border-slate-100 p-6 rounded-2xl">
                <h4 className="font-black text-xs text-primary-600 uppercase mb-2">Real-time Feed</h4>
                <p className="text-xs text-slate-500">Monitors cluster capacity, editorial synchronization, and user connectivity in real-time via WebSocket heartbeats.</p>
             </div>
             <div className="border border-slate-100 p-6 rounded-2xl">
                <h4 className="font-black text-xs text-primary-600 uppercase mb-2">Quick Transmissions</h4>
                <p className="text-xs text-slate-500">Instant shortcuts to initialize new narrative archives or view global system logs.</p>
             </div>
          </div>
        </section>

        {/* Editorial Workflow */}
        <section className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 border-l-4 border-primary-600 pl-6">04. Editorial Orchestration</h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-black text-slate-900 uppercase text-sm mb-4 italic">Rich Text Intelligence</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                The NewsVortex Editor utilizes the TipTap engine for collaborative narrative construction. Features include:
              </p>
              <ul className="list-disc pl-6 text-sm text-slate-500 space-y-2">
                <li><strong>Semantic Formatting:</strong> Bold, Italic, Underline, and Hierarchical Headings (H2/H3).</li>
                <li><strong>Structure:</strong> Bulleted and Ordered lists for structured reporting.</li>
                <li><strong>Rich Elements:</strong> Blockquotes for citation and Highlight markers for editorial notes.</li>
              </ul>
            </div>
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
               <h4 className="font-black uppercase text-[10px] tracking-widest text-primary-400 mb-4">Collaborative Presence</h4>
               <p className="text-xs text-slate-400 leading-relaxed">
                 When multiple editors access a story, the system displays <strong>Live Presence Widgets</strong> in the editor header. This indicates real-time concurrency and prevents narrative collisions.
               </p>
            </div>
          </div>
        </section>

        {/* Wire & Rundowns */}
        <section className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 border-l-4 border-primary-600 pl-6">05. Global Feeds & Production</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-black text-slate-900 uppercase text-xs mb-3">Wire Intelligence</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect to global sources like Reuters and AP. Use the "Import to Archive" feature to transform raw wire items into editorial drafts within the NewsVortex environment.
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase text-xs mb-3">Rundown Orchestration</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Define broadcast shows, schedule instances, and sequence segments (Story, Break, Live, Interview). The Rundown Editor tracks duration and syncs status across the control room.
              </p>
            </div>
          </div>
        </section>

        {/* Diagnostic Sentinel */}
        <section className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 border-l-4 border-primary-600 pl-6">06. Diagnostic Sentinel</h2>
          <p className="text-slate-600 mb-4">The sentinel node ensures the health of the underlying cluster (Node.js, PostgreSQL, Redis).</p>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
            <h4 className="font-black text-xs text-slate-900 uppercase mb-4">Vision Detection System</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload screenshots of system logs or architectural requests. The AI-integrated sentinel will analyze environment variables, runtime versions, and can even generate full project blueprints for NewsVortex extensions.
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-20 pt-10 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">© HATMANN GLOBAL BROADCAST SYSTEMS • 2025</p>
        </div>

      </div>
    </div>
  );
}