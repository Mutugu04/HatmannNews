import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string, plainText: string, wordCount: number) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing your story...',
  readOnly = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Highlight,
      Underline,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      onChange(html, text, words);
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      {!readOnly && (
        <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2 py-1 rounded ${editor.isActive('underline') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
          >
            <u>U</u>
          </button>
          
          <span className="border-l mx-2" />
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
          >
            H3
          </button>
          
          <span className="border-l mx-2" />
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
          >
            1. List
          </button>
          
          <span className="border-l mx-2" />
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-1 rounded ${editor.isActive('blockquote') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
          >
            Quote
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`px-2 py-1 rounded ${editor.isActive('highlight') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
          >
            Highlight
          </button>
        </div>
      )}
      
      <div className="p-4 min-h-[400px] bg-white text-slate-900">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
