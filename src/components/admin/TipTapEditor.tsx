import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    List,
    ListOrdered,
    Quote,
    Code,
    Minus,
    ImageIcon,
    Link as LinkIcon,
    Maximize,
    Minimize,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TipTapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
    content,
    onChange,
    placeholder = 'İçeriğinizi buraya yazın...',
    className,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);

            // Calculate word count
            const text = editor.getText();
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none p-4',
            },
        },
    });

    const addImage = () => {
        const url = window.prompt('Görsel URL\'sini girin:');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addLink = () => {
        const url = window.prompt('Link URL\'sini girin:');
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({
        onClick,
        active,
        disabled,
        children,
        title,
    }: {
        onClick: () => void;
        active?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                active && 'bg-gray-200 dark:bg-gray-600',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            {children}
        </button>
    );

    return (
        <div
            className={cn(
                'border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800',
                isFullscreen && 'fixed inset-0 z-50 rounded-none',
                className
            )}
        >
            {/* Toolbar */}
            <div className="border-b border-gray-300 dark:border-gray-700 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-900">
                {/* Text Formatting */}
                <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive('bold')}
                        title="Kalın (Ctrl+B)"
                    >
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive('italic')}
                        title="İtalik (Ctrl+I)"
                    >
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        active={editor.isActive('strike')}
                        title="Üstü Çizili"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Headings */}
                <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        active={editor.isActive('heading', { level: 1 })}
                        title="Başlık 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={editor.isActive('heading', { level: 2 })}
                        title="Başlık 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        active={editor.isActive('heading', { level: 3 })}
                        title="Başlık 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                        active={editor.isActive('heading', { level: 4 })}
                        title="Başlık 4"
                    >
                        <Heading4 className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Lists */}
                <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive('bulletList')}
                        title="Madde İşaretli Liste"
                    >
                        <List className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive('orderedList')}
                        title="Numaralı Liste"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Block Elements */}
                <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        active={editor.isActive('blockquote')}
                        title="Alıntı"
                    >
                        <Quote className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        active={editor.isActive('codeBlock')}
                        title="Kod Bloğu"
                    >
                        <Code className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Yatay Çizgi"
                    >
                        <Minus className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Media */}
                <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
                    <ToolbarButton onClick={addImage} title="Görsel Ekle">
                        <ImageIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={addLink}
                        active={editor.isActive('link')}
                        title="Link Ekle"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Fullscreen */}
                <div className="flex gap-1 ml-auto">
                    <ToolbarButton onClick={toggleFullscreen} title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}>
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </ToolbarButton>
                </div>
            </div>

            {/* Editor Content */}
            <div className={cn('overflow-y-auto', isFullscreen ? 'h-[calc(100vh-120px)]' : 'max-h-[500px]')}>
                <EditorContent editor={editor} />
            </div>

            {/* Footer with Word Count */}
            <div className="border-t border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400">
                <span>{wordCount} kelime</span>
            </div>
        </div>
    );
};
