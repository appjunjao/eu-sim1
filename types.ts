export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Tick {
  time: number;
  bid: number;
  ask: number;
}

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface Position {
  id: string;
  type: OrderType;
  symbol: string;
  lots: number;
  openPrice: number;
  openTime: number;
  sl?: number;
  tp?: number;
}

export interface AccountState {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
}

export interface MarketAnalysis {
  headline: string;
  analysis: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}
