import { Tick } from '../types';

export class MarketSimulator {
  private currentPrice: number = 1.0850;
  private volatility: number = 0.0002;
  private trend: number = 0; // -1 to 1

  // Generate next tick based on random walk with optional trend bias
  nextTick(): Tick {
    const change = (Math.random() - 0.5 + (this.trend * 0.1)) * this.volatility;
    this.currentPrice += change;
    
    // Ensure price doesn't go negative or too crazy
    if (this.currentPrice < 0.5) this.currentPrice = 0.5;
    if (this.currentPrice > 1.5) this.currentPrice = 1.5;

    // Spread simulation (e.g., 1-2 pips)
    const spread = 0.00015; 
    
    return {
      time: Date.now(),
      bid: this.currentPrice,
      ask: this.currentPrice + spread
    };
  }

  setTrend(trend: number) {
    this.trend = Math.max(-1, Math.min(1, trend));
  }
}

export const marketSimulator = new MarketSimulator();
