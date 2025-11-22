import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Tick } from '../types';

interface Props {
  data: Tick[];
}

export const TradingChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map(d => ({
    ...d,
    timeStr: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }));

  const minPrice = Math.min(...data.map(d => d.bid)) * 0.9995;
  const maxPrice = Math.max(...data.map(d => d.ask)) * 1.0005;

  return (
    <div className="h-64 md:h-96 w-full bg-slate-900 rounded-lg p-2 shadow-inner border border-slate-700">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis 
            dataKey="timeStr" 
            stroke="#64748b" 
            tick={{fontSize: 10}} 
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            stroke="#64748b" 
            tick={{fontSize: 10}} 
            tickFormatter={(val) => val.toFixed(4)}
            width={60}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
            formatter={(value: number) => [value.toFixed(5), 'Price']}
          />
          <Area 
            type="monotone" 
            dataKey="bid" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
