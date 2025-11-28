import React from 'react';

interface ToggleSwitchProps {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  label: string;
  icon?: React.ReactNode;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isChecked, onChange, label, icon }) => {
  return (
    <button
      onClick={() => onChange(!isChecked)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
        isChecked
          ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
          : 'bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:border-zinc-600'
      }`}
    >
      {icon}
      {label}
      <div className={`w-2 h-2 rounded-full ${isChecked ? 'bg-blue-400 animate-pulse' : 'bg-zinc-600'}`} />
    </button>
  );
};
