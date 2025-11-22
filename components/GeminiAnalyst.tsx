import React, { useState } from 'react';
import { MarketAnalysis, Tick } from '../types';
import { getMarketAnalysis } from '../services/geminiService';
import { Loader2, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  currentPrice: number;
  priceHistory: Tick[];
}

export const GeminiAnalyst: React.FC<Props> = ({ currentPrice, priceHistory }) => {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    // Determine rough trend
    const start = priceHistory[0]?.bid || currentPrice;
    const end = currentPrice;
    const trend = end > start ? 'UP' : end < start ? 'DOWN' : 'FLAT';
    
    const result = await getMarketAnalysis(currentPrice, trend);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-800 p-6 rounded-lg shadow-lg border border-indigo-700 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={100} />
      </div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={20}/> 
            Gemini Market Analyst
          </h3>
          <p className="text-indigo-200 text-xs mt-1">AI-Powered Insights</p>
        </div>
        <button 
          onClick={handleAnalyze} 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : "Generate Analysis"}
        </button>
      </div>

      {analysis && (
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-3 mb-2">
             {analysis.sentiment === 'BULLISH' && <TrendingUp className="text-green-400" size={24} />}
             {analysis.sentiment === 'BEARISH' && <TrendingDown className="text-red-400" size={24} />}
             {analysis.sentiment === 'NEUTRAL' && <Minus className="text-gray-400" size={24} />}
             <span className={`font-bold text-lg ${
               analysis.sentiment === 'BULLISH' ? 'text-green-400' : 
               analysis.sentiment === 'BEARISH' ? 'text-red-400' : 'text-gray-400'
             }`}>
               {analysis.sentiment}
             </span>
          </div>
          <h4 className="font-bold text-lg mb-2 text-white">{analysis.headline}</h4>
          <p className="text-indigo-100 text-sm leading-relaxed opacity-90">{analysis.analysis}</p>
        </div>
      )}
      
      {!analysis && !loading && (
        <div className="text-center py-8 text-indigo-300 relative z-10">
          <p className="text-sm">Click the button to get real-time AI market commentary.</p>
        </div>
      )}
    </div>
  );
};
