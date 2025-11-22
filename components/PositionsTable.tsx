import React from 'react';
import { Position, Tick, OrderType } from '../types';

interface Props {
  positions: Position[];
  currentTick: Tick;
  onClose: (id: string) => void;
}

export const PositionsTable: React.FC<Props> = ({ positions, currentTick, onClose }) => {
  const calculateProfit = (pos: Position) => {
    const multiplier = pos.type === OrderType.BUY ? 1 : -1;
    const currentPrice = pos.type === OrderType.BUY ? currentTick.bid : currentTick.ask;
    const diff = currentPrice - pos.openPrice;
    // Standard Lot = 100,000 units. Profit = Diff * Units
    return diff * multiplier * pos.lots * 100000;
  };

  if (positions.length === 0) {
    return (
      <div className="bg-slate-800 p-8 text-center text-slate-500 rounded-lg border border-slate-700 italic">
        No open positions
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs uppercase bg-slate-900 text-slate-400">
            <tr>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Lots</th>
              <th className="px-6 py-3">Open Price</th>
              <th className="px-6 py-3">SL</th>
              <th className="px-6 py-3">TP</th>
              <th className="px-6 py-3">Current Price</th>
              <th className="px-6 py-3">Profit (USD)</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => {
              const profit = calculateProfit(pos);
              const isProfit = profit >= 0;
              const currentPrice = pos.type === OrderType.BUY ? currentTick.bid : currentTick.ask;
              
              return (
                <tr key={pos.id} className="border-b border-slate-700 hover:bg-slate-750">
                  <td className={`px-6 py-4 font-bold ${pos.type === OrderType.BUY ? 'text-blue-400' : 'text-red-400'}`}>
                    {pos.type}
                  </td>
                  <td className="px-6 py-4">{pos.lots}</td>
                  <td className="px-6 py-4 font-mono">{pos.openPrice.toFixed(5)}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{pos.sl ? pos.sl.toFixed(5) : '-'}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{pos.tp ? pos.tp.toFixed(5) : '-'}</td>
                  <td className="px-6 py-4 font-mono">{currentPrice.toFixed(5)}</td>
                  <td className={`px-6 py-4 font-mono font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {profit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onClose(pos.id)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white transition-colors"
                    >
                      Close
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};