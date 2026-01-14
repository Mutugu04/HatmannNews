
import React from 'react';

interface TerminalOutputProps {
  command: string;
  output?: string;
  isError?: boolean;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ command, output, isError }) => {
  return (
    <div className="bg-black rounded-lg p-4 font-mono text-sm border border-slate-700 shadow-xl overflow-hidden">
      <div className="flex gap-2 mb-3">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <div className="flex gap-2">
        <span className="text-green-400">$</span>
        <span className="text-slate-200">{command}</span>
      </div>
      {output && (
        <div className={`mt-2 ${isError ? 'text-red-400' : 'text-slate-400'} whitespace-pre-wrap`}>
          {output}
        </div>
      )}
    </div>
  );
};

export default TerminalOutput;
