import React, { forwardRef, useImperativeHandle } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import {
    Pilcrow, Heading2, Heading3, Bold, Italic,
    List, ListOrdered, Link2, TextQuote, Undo2, Redo2
} from 'lucide-react';
import { markdownToLegalHtml } from './clientLegalHtml';
import LegalLinkModal, { type LegalLinkRequest } from './LegalLinkModal';

export interface LegalVisualEditorHandle {
    insertHeading: (text: string) => void;
    insertLink: (href: string, label: string) => void;
}

interface Props {
    initialMarkdown: string;
    onMarkdownChange: (markdown: string) => void;
}

interface ToolbarButtonProps {
    onClick: () => void;
    label: string;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, label, active, disabled, children }) => (
    <button
        type="button"
        title={label}
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors disabled:opacity-30 ${active ? 'bg-brand-emerald/15 text-brand-emerald' : 'hover:bg-slate-100 hover:text-brand-navy'}`}
    >
        {children}
    </button>
);

const LegalVisualEditor = forwardRef<LegalVisualEditorHandle, Props>((props, ref) => {
    const { initialMarkdown, onMarkdownChange } = props;
    const [linkOpen, setLinkOpen] = React.useState(false);

    const editor = useEditor({
        shouldRerenderOnTransaction: true,
        content: markdownToLegalHtml(initialMarkdown || ''),
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                link: false
            }),
            Link.configure({
                openOnClick: false,
                protocols: ['https', 'http', 'mailto'],
                HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' }
            }),
            Markdown
        ],
        editorProps: {
            attributes: { class: 'legal-editor-area', spellcheck: 'true' }
        },
        onUpdate: ({ editor: e }) => {
            const storage = e.storage as { markdown?: { getMarkdown(): string } };
            onMarkdownChange(storage.markdown ? storage.markdown.getMarkdown() : '');
        }
    });

    const applyInsertHeading = (text: string) => {
        const title = (text || '').trim();
        if (!title || !editor) return;
        editor
            .chain()
            .focus()
            .insertContent({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: title }] })
            .insertContent({ type: 'paragraph' })
            .run();
    };

    const applyInsertLink = (href: string, label: string) => {
        if (!editor) return;
        const chain = editor.chain().focus();
        if (editor.state.selection.empty) {
            chain.insertContent({
                type: 'text',
                text: label,
                marks: [{ type: 'link', attrs: { href } }]
            });
        } else {
            chain.setLink({ href });
        }
        chain.run();
    };

    useImperativeHandle(ref, () => ({
        insertHeading: applyInsertHeading,
        insertLink: applyInsertLink
    }), [editor]);

    const run = (fn: (e: Editor) => void) => {
        if (!editor) return;
        fn(editor);
    };

    const onInsertLink = (request: LegalLinkRequest) => {
        setLinkOpen(false);
        applyInsertLink(request.href, request.label);
    };

    return (
        <div>
            <div className="flex flex-wrap items-center gap-1 border border-slate-200 rounded-t-xl bg-slate-50 px-2 py-1.5">
                <ToolbarButton label="Paragraph" active={editor?.isActive('paragraph')} onClick={() => run(e => e.chain().focus().setParagraph().run())}><Pilcrow size={16} /></ToolbarButton>
                <ToolbarButton label="Heading 2" active={editor?.isActive('heading', { level: 2 })} onClick={() => run(e => e.chain().focus().toggleHeading({ level: 2 }).run())}><Heading2 size={16} /></ToolbarButton>
                <ToolbarButton label="Heading 3" active={editor?.isActive('heading', { level: 3 })} onClick={() => run(e => e.chain().focus().toggleHeading({ level: 3 }).run())}><Heading3 size={16} /></ToolbarButton>
                <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
                <ToolbarButton label="Bold" active={editor?.isActive('bold')} onClick={() => run(e => e.chain().focus().toggleBold().run())}><Bold size={16} /></ToolbarButton>
                <ToolbarButton label="Italic" active={editor?.isActive('italic')} onClick={() => run(e => e.chain().focus().toggleItalic().run())}><Italic size={16} /></ToolbarButton>
                <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
                <ToolbarButton label="Bulleted list" active={editor?.isActive('bulletList')} onClick={() => run(e => e.chain().focus().toggleBulletList().run())}><List size={16} /></ToolbarButton>
                <ToolbarButton label="Numbered list" active={editor?.isActive('orderedList')} onClick={() => run(e => e.chain().focus().toggleOrderedList().run())}><ListOrdered size={16} /></ToolbarButton>
                <ToolbarButton label="Blockquote" active={editor?.isActive('blockquote')} onClick={() => run(e => e.chain().focus().toggleBlockquote().run())}><TextQuote size={16} /></ToolbarButton>
                <ToolbarButton label="Insert link" onClick={() => setLinkOpen(true)}><Link2 size={16} /></ToolbarButton>
                <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
                <ToolbarButton label="Undo" disabled={!editor?.can().undo()} onClick={() => run(e => e.chain().focus().undo().run())}><Undo2 size={16} /></ToolbarButton>
                <ToolbarButton label="Redo" disabled={!editor?.can().redo()} onClick={() => run(e => e.chain().focus().redo().run())}><Redo2 size={16} /></ToolbarButton>
            </div>
            <EditorContent editor={editor} className="rounded-b-xl overflow-hidden" />
            {linkOpen && (
                <LegalLinkModal
                    onClose={() => setLinkOpen(false)}
                    onInsert={onInsertLink}
                />
            )}
        </div>
    );
});

LegalVisualEditor.displayName = 'LegalVisualEditor';

export default LegalVisualEditor;