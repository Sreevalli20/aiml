import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useRole } from '../../state/RoleContext';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  onSelectPrompt,
  disabled = false
}) => {
  const { currentPersona } = useRole();

  return (
    <div className="w-full">
      <div className="flex items-center space-x-1.5 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>Suggested Queries for {currentPersona.title}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {currentPersona.suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(prompt)}
            className="p-4 border border-slate-200 bg-white rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group shadow-xs cursor-pointer disabled:opacity-50"
          >
            <p className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wider">
              {i === 0 ? 'Attendance' : i === 1 ? 'Academic' : 'Inquiry'}
            </p>
            <p className="text-xs text-slate-700 font-medium group-hover:text-blue-900 transition-colors leading-relaxed flex items-center justify-between">
              <span>&ldquo;{prompt}&rdquo;</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity ml-1 shrink-0" />
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
