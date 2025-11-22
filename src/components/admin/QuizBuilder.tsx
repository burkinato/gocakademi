import React from 'react';
import { QuizConfig, QuizQuestion } from '../../types';

interface QuizBuilderProps {
  value: QuizConfig;
  onChange: (quiz: QuizConfig) => void;
}

const emptyQuestion = (): QuizQuestion => ({
  id: crypto.randomUUID?.() ?? `quiz-${Date.now()}-${Math.random()}`,
  prompt: '',
  options: ['', '', '', ''],
  answerIndex: 0,
});

export const QuizBuilder: React.FC<QuizBuilderProps> = ({ value, onChange }) => {
  const updateQuestion = (index: number, updated: Partial<QuizQuestion>) => {
    const questions = [...value.questions];
    questions[index] = { ...questions[index], ...updated };
    onChange({ ...value, questions });
  };

  const handleOptionChange = (qIndex: number, optionIndex: number, optionValue: string) => {
    const questions = [...value.questions];
    const options = [...questions[qIndex].options];
    options[optionIndex] = optionValue;
    questions[qIndex] = { ...questions[qIndex], options };
    onChange({ ...value, questions });
  };

  const addQuestion = () => {
    onChange({ ...value, questions: [...value.questions, emptyQuestion()] });
  };

  const removeQuestion = (id: string) => {
    onChange({ ...value, questions: value.questions.filter(question => question.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Süre (dk)</label>
        <input
          type="number"
          min={0}
          className="form-input w-32 rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          value={value.durationMinutes || ''}
          onChange={(e) => onChange({ ...value, durationMinutes: Number(e.target.value) })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.allowRetry ?? false}
            onChange={(e) => onChange({ ...value, allowRetry: e.target.checked })}
          />
          Tekrar denemeye izin ver
        </label>
      </div>

      <div className="space-y-4">
        {value.questions.map((question, qIndex) => (
          <div key={question.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Soru {qIndex + 1}</p>
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-700"
                onClick={() => removeQuestion(question.id)}
              >
                Sil
              </button>
            </div>
            <textarea
              className="form-textarea w-full text-sm rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              placeholder="Soru metni"
              value={question.prompt}
              onChange={(e) => updateQuestion(qIndex, { prompt: e.target.value })}
            />
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={question.answerIndex === optionIndex}
                    onChange={() => updateQuestion(qIndex, { answerIndex: optionIndex })}
                  />
                  <input
                    className="form-input flex-1 rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    placeholder={`Seçenek ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(qIndex, optionIndex, e.target.value)}
                  />
                </label>
              ))}
            </div>
            <textarea
              className="form-textarea w-full text-sm rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              placeholder="Çözüm / Açıklama (opsiyonel)"
              value={question.explanation || ''}
              onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        className="w-full border border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-2 text-sm text-primary hover:bg-primary/5"
        onClick={addQuestion}
      >
        Soru Ekle
      </button>
    </div>
  );
};
