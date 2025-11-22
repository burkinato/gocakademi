import React, { useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const actions: Array<{ icon: string; command: string; value?: string; label: string }> = [
  { icon: 'format_bold', command: 'bold', label: 'Kalın' },
  { icon: 'format_italic', command: 'italic', label: 'İtalik' },
  { icon: 'format_list_bulleted', command: 'insertUnorderedList', label: 'Liste' },
  { icon: 'format_list_numbered', command: 'insertOrderedList', label: 'Numaralı Liste' },
  { icon: 'format_quote', command: 'formatBlock', value: 'blockquote', label: 'Alıntı' },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const handleCommand = (command: string, valueArg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, valueArg);
    const html = editorRef.current?.innerHTML || '';
    onChange(html);
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1 text-gray-500 text-sm">
        {actions.map(action => (
          <button
            key={action.command + action.icon}
            type="button"
            title={action.label}
            className="p-1.5 rounded hover:bg-white hover:text-primary transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              handleCommand(action.command, action.value);
            }}
          >
            <span className="material-symbols-outlined text-base">{action.icon}</span>
          </button>
        ))}
        <button
          type="button"
          className="ml-auto px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-white"
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('removeFormat');
          }}
        >
          Formatı Temizle
        </button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[180px] px-3 py-2 focus:outline-none text-sm bg-white dark:bg-gray-900 text-text-light dark:text-text-dark text-left leading-relaxed"
        contentEditable
        dir="ltr"
        style={{ direction: 'ltr', textAlign: 'left', whiteSpace: 'pre-wrap' }}
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        data-placeholder={placeholder}
      />
    </div>
  );
};
