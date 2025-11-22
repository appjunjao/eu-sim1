import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Tick, Position, AccountState, OrderType } from './types';
import { marketSimulator } from './services/marketSimulator';
import { TradingChart } from './components/TradingChart';
import { OrderPanel } from './components/OrderPanel';
import { PositionsTable } from './components/PositionsTable';
import { AccountInfo } from './components/AccountInfo';
import { GeminiAnalyst } from './components/GeminiAnalyst';
import { LayoutDashboard, Wallet, History, AlertCircle } from 'lucide-react';

const INITIAL_BALANCE = 10000;
const LEVERAGE = 100;

export default function App() {
  // Market State
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [currentTick, setCurrentTick] = useState<Tick>({ time: Date.now(), bid: 1.0850, ask: 1.08515 });
  
  // Account State
  const [positions, setPositions] = useState<Position[]>([]);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  
  // UI State
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const newTick = marketSimulator.nextTick();
      setCurrentTick(newTick);
      setTicks(prev => {
        const updated = [...prev, newTick];
        if (updated.length > 60) return updated.slice(updated.length - 60);
        return updated;
      });
    }, 1000); // 1 tick per second

    return () => clearInterval(interval);
  }, []);

  // Check Stop Loss and Take Profit
  useEffect(() => {
    let profitChange = 0;
    const closedIds = new Set<string>();
    const closedDetails: {id: string, profit: number, reason: string}[] = [];

    positions.forEach(pos => {
      let closed = false;
      let closePrice = 0;
      let reason = '';

      if (pos.type === OrderType.BUY) {
        // Buy orders are closed at Bid price
        if (pos.sl && currentTick.bid <= pos.sl) {
          closed = true;
          closePrice = pos.sl;
          reason = 'Stop Loss';
        } else if (pos.tp && currentTick.bid >= pos.tp) {
          closed = true;
          closePrice = pos.tp;
          reason = 'Take Profit';
        }
      } else {
        // Sell orders are closed at Ask price
        if (pos.sl && currentTick.ask >= pos.sl) {
          closed = true;
          closePrice = pos.sl;
          reason = 'Stop Loss';
        } else if (pos.tp && currentTick.ask <= pos.tp) {
          closed = true;
          closePrice = pos.tp;
          reason = 'Take Profit';
        }
      }

      if (closed) {
        const multiplier = pos.type === OrderType.BUY ? 1 : -1;
        const diff = closePrice - pos.openPrice;
        const profit = diff * multiplier * pos.lots * 100000;
        profitChange += profit;
        closedIds.add(pos.id);
        closedDetails.push({ id: pos.id, profit, reason });
      }
    });

    if (closedIds.size > 0) {
      setPositions(prev => prev.filter(p => !closedIds.has(p.id)));
      setBalance(prev => prev + profitChange);
      
      // Show notification for the first closed position (to avoid spam)
      const lastClosed = closedDetails[0];
      setNotification({
        msg: `${lastClosed.reason} hit! Closed ${lastClosed.profit >= 0 ? 'with Profit' : 'with Loss'}: $${lastClosed.profit.toFixed(2)}`,
        type: lastClosed.profit >= 0 ? 'success' : 'error'
      });
      
      setTimeout(() => setNotification(null), 4000);
    }
  }, [currentTick, positions]);

  // Derived Account Metrics
  const accountMetrics: AccountState = useMemo(() => {
    let equity = balance;
    let usedMargin = 0;

    positions.forEach(pos => {
      const currentPrice = pos.type === OrderType.BUY ? currentTick.bid : currentTick.ask;
      const diff = currentPrice - pos.openPrice;
      const multiplier = pos.type === OrderType.BUY ? 1 : -1;
      const profit = diff * multiplier * pos.lots * 100000;
      
      equity += profit;
      // Margin = (Lots * Contract Size * Market Price) / Leverage
      usedMargin += (pos.lots * 100000 * pos.openPrice) / LEVERAGE;
    });

    const freeMargin = equity - usedMargin;
    const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 0;

    return {
      balance,
      equity,
      margin: usedMargin,
      freeMargin,
      marginLevel
    };
  }, [balance, positions, currentTick]);

  // Margin Call Check
  useEffect(() => {
    if (accountMetrics.margin > 0 && accountMetrics.marginLevel < 50) {
      setPositions([]);
      setBalance(accountMetrics.equity);
      alert("MARGIN CALL! All positions closed.");
    }
  }, [accountMetrics.marginLevel, accountMetrics.margin, accountMetrics.equity]);

  // Actions
  const handleOrder = (type: OrderType, lots: number, sl?: number, tp?: number) => {
    const marginRequired = (lots * 100000 * currentTick.ask) / LEVERAGE;
    
    if (marginRequired > accountMetrics.freeMargin) {
      alert("Not enough money! (Free Margin too low)");
      return;
    }

    const newPosition: Position = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      symbol: 'EURUSD',
      lots,
      openPrice: type === OrderType.BUY ? currentTick.ask : currentTick.bid,
      openTime: Date.now(),
      sl,
      tp
    };
    
    setPositions(prev => [newPosition, ...prev]);
  };

  const handleClosePosition = (id: string) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;

    const currentPrice = pos.type === OrderType.BUY ? currentTick.bid : currentTick.ask;
    const diff = currentPrice - pos.openPrice;
    const multiplier = pos.type === OrderType.BUY ? 1 : -1;
    const profit = diff * multiplier * pos.lots * 100000;

    setBalance(prev => prev + profit);
    setPositions(prev => prev.filter(p => p.id !== id));
  };

  const handleDeposit = () => {
    setBalance(prev => prev + 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-6 right-6 p-4 rounded shadow-xl z-50 text-white font-bold animate-in slide-in-from-right fade-in duration-300 flex items-center gap-2 border ${notification.type === 'success' ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'}`}>
          {notification.type === 'success' ? <Wallet size={20} /> : <AlertCircle size={20} />}
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">FX</div>
            <h1 className="text-xl font-bold text-white">ProTrader Sim</h1>
          </div>
          <div className="text-xs text-slate-500">REALTIME EUR/USD SIMULATION</div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Account Info Bar */}
        <section>
          <AccountInfo account={accountMetrics} onDeposit={handleDeposit} />
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Chart & Analysis */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
               <div className="flex justify-between items-center mb-4 px-2">
                 <h2 className="text-white font-bold flex items-center gap-2">
                   <LayoutDashboard size={18}/> EUR/USD Chart
                 </h2>
                 <div className="flex gap-4 text-sm font-mono">
                   <span className="text-blue-400">Bid: {currentTick.bid.toFixed(5)}</span>
                   <span className="text-red-400">Ask: {currentTick.ask.toFixed(5)}</span>
                 </div>
               </div>
               <TradingChart data={ticks} />
             </div>
             
             <GeminiAnalyst currentPrice={currentTick.bid} priceHistory={ticks} />
          </div>

          {/* Right Column: Order Entry & Positions */}
          <div className="space-y-6">
            <OrderPanel 
              currentTick={currentTick} 
              onBuy={(lots, sl, tp) => handleOrder(OrderType.BUY, lots, sl, tp)}
              onSell={(lots, sl, tp) => handleOrder(OrderType.SELL, lots, sl, tp)}
            />

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
               <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                 <AlertCircle size={18} className="text-yellow-500"/> Simulation Info
               </h3>
               <ul className="text-sm text-slate-400 space-y-2">
                 <li>• Leverage: 1:{LEVERAGE}</li>
                 <li>• Contract Size: 100,000</li>
                 <li>• Currency: USD</li>
                 <li>• Initial Balance: $10,000</li>
               </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section: Positions */}
        <section className="pb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <History size={20}/> Open Positions ({positions.length})
          </h2>
          <PositionsTable 
            positions={positions} 
            currentTick={currentTick} 
            onClose={handleClosePosition} 
          />
        </section>
      </main>
    </div>
  );
}