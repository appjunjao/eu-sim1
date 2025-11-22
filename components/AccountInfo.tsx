import React from 'react';
import { AccountState } from '../types';

interface Props {
  account: AccountState;
  onDeposit: () => void;
}

export const AccountInfo: React.FC<Props> = ({ account, onDeposit }) => {
  const formatMoney = (val: number) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md flex flex-wrap gap-4 items-center justify-between border-b-4 border-slate-700">
      <div className="flex gap-6 text-sm md:text-base">
        <div>
          <span className="text-slate-400 block text-xs">Balance</span>
          <span className="font-mono font-bold text-white">{formatMoney(account.balance)}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-xs">Equity</span>
          <span className={`font-mono font-bold ${account.equity >= account.balance ? 'text-green-400' : 'text-red-400'}`}>
            {formatMoney(account.equity)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-xs">Margin</span>
          <span className="font-mono text-white">{formatMoney(account.margin)}</span>
        </div>
        <div className="hidden sm:block">
          <span className="text-slate-400 block text-xs">Free Margin</span>
          <span className="font-mono text-white">{formatMoney(account.freeMargin)}</span>
        </div>
        <div className="hidden sm:block">
          <span className="text-slate-400 block text-xs">Level</span>
          <span className="font-mono text-white">{account.marginLevel.toFixed(0)}%</span>
        </div>
      </div>
      <button 
        onClick={onDeposit}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
      >
        + Deposit
      </button>
    </div>
  );
};
