import React from 'react';
import { DesignAnalysis } from '../types';
import { Home, Palette, Layout, Lightbulb } from 'lucide-react';

interface AnalysisViewProps {
  analysis: DesignAnalysis;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 h-full">
      <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
        Architectural Analysis
      </h3>

      <div className="space-y-6">
        <div className="flex gap-4 items-start">
          <div className="bg-blue-100 p-2 rounded-lg shrink-0">
            <Home className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Style</h4>
            <p className="text-slate-600 leading-relaxed">{analysis.architecturalStyle}</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="bg-amber-100 p-2 rounded-lg shrink-0">
            <Palette className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Materials</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.keyMaterials.map((mat, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                  {mat}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="bg-emerald-100 p-2 rounded-lg shrink-0">
            <Layout className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Layout</h4>
            <p className="text-slate-600 leading-relaxed text-sm">{analysis.layoutSummary}</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="bg-purple-100 p-2 rounded-lg shrink-0">
            <Lightbulb className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Suggestions</h4>
            <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
              {analysis.designSuggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};