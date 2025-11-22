import React, { useState } from 'react';
import { Tick } from '../types';

interface Props {
  currentTick: Tick;
  onBuy: (lots: number, sl?: number, tp?: number) => void;
  onSell: (lots: number, sl?: number, tp?: number) => void;
}

export const OrderPanel: React.FC<Props> = ({ currentTick, onBuy, onSell }) => {
  const [lots, setLots] = useState<number>(0.1);
  const [sl, setSl] = useState<string>('');
  const [tp, setTp] = useState<string>('');

  const handleLotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (val < 0.01) val = 0.01;
    if (val > 10) val = 10;
    setLots(val);
  };

  const validateAndSend = (type: 'BUY' | 'SELL') => {
    const slVal = sl ? parseFloat(sl) : undefined;
    const tpVal = tp ? parseFloat(tp) : undefined;

    // Basic validation
    // Note: We use Ask for Buy entry and Bid for Sell entry comparison roughly
    if (type === 'BUY') {
      if (slVal && slVal >= currentTick.ask) {
        alert("Invalid SL: For a BUY order, Stop Loss must be BELOW the Ask price.");
        return;
      }
      if (tpVal && tpVal <= currentTick.ask) {
        alert("Invalid TP: For a BUY order, Take Profit must be ABOVE the Ask price.");
        return;
      }
    } else {
      if (slVal && slVal <= currentTick.bid) {
        alert("Invalid SL: For a SELL order, Stop Loss must be ABOVE the Bid price.");
        return;
      }
      if (tpVal && tpVal >= currentTick.bid) {
        alert("Invalid TP: For a SELL order, Take Profit must be BELOW the Bid price.");
        return;
      }
    }

    if (type === 'BUY') onBuy(lots, slVal, tpVal);
    else onSell(lots, slVal, tpVal);

    // Reset optional fields
    setSl('');
    setTp('');
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700 flex flex-col gap-4">
      <h3 className="text-white font-bold text-lg border-b border-slate-700 pb-2">New Order (EUR/USD)</h3>
      
      <div className="flex flex-col gap-2">
        <label className="text-slate-400 text-sm">Volume (Lots)</label>
        <input 
          type="number" 
          step="0.01" 
          min="0.01" 
          max="10" 
          value={lots} 
          onChange={handleLotsChange}
          className="bg-slate-900 text-white p-3 rounded border border-slate-600 focus:border-blue-500 focus:outline-none font-mono text-lg"
        />
        <span className="text-xs text-slate-500">1 Lot = 100,000 Units</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-slate-400 text-xs">Stop Loss (Optional)</label>
          <input 
            type="number" 
            step="0.0001" 
            placeholder="Price"
            value={sl} 
            onChange={(e) => setSl(e.target.value)}
            className="bg-slate-900 text-white p-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-slate-400 text-xs">Take Profit (Optional)</label>
          <input 
            type="number" 
            step="0.0001" 
            placeholder="Price"
            value={tp} 
            onChange={(e) => setTp(e.target.value)}
            className="bg-slate-900 text-white p-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <button 
          onClick={() => validateAndSend('SELL')}
          className="flex flex-col items-center justify-center bg-red-600 hover:bg-red-700 text-white py-4 rounded transition-colors active:scale-95 group"
        >
          <span className="text-sm font-bold uppercase mb-1">Sell</span>
          <span className="text-xl font-mono group-hover:scale-110 transition-transform">{currentTick.bid.toFixed(5)}</span>
        </button>

        <button 
          onClick={() => validateAndSend('BUY')}
          className="flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-4 rounded transition-colors active:scale-95 group"
        >
          <span className="text-sm font-bold uppercase mb-1">Buy</span>
          <span className="text-xl font-mono group-hover:scale-110 transition-transform">{currentTick.ask.toFixed(5)}</span>
        </button>
      </div>

      <div className="text-center text-xs text-slate-500 mt-2">
        Spread: {((currentTick.ask - currentTick.bid) * 10000).toFixed(1)} pips
      </div>
    </div>
  );
};