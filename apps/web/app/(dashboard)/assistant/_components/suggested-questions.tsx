'use client';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  disabled: boolean;
}

export function SuggestedQuestions({ questions, onSelect, disabled }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-2">
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="w-full rounded-md border px-3 py-2 text-left text-xs transition-colors hover:bg-muted disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
