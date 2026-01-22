
import React from 'react';

interface SettingsGroupProps {
  label: string;
  children: React.ReactNode;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({ label, children }) => {
  return (
    <div className="mb-6">
      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
};

interface SettingButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const SettingButton: React.FC<SettingButtonProps> = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
        active 
          ? "bg-zinc-100 text-zinc-900 border-zinc-100 font-medium" 
          : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
};
