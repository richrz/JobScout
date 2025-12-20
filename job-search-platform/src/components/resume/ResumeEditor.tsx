'use client';

import React, { useEffect, useRef } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser, Node } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-menu/style/menu.css';
import 'prosemirror-example-setup/style/style.css';

// Create a schema with list support
const resumeSchema = new Schema({
    nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
    marks: basicSchema.spec.marks,
});

interface ResumeEditorProps {
    initialContent?: string;
    onChange?: (content: string) => void;
}

export function ResumeEditor({ initialContent = '', onChange }: ResumeEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (!editorRef.current) return;

        // Parse initial HTML content
        const contentElement = document.createElement('div');
        contentElement.innerHTML = initialContent || '<p></p>';

        const doc = DOMParser.fromSchema(resumeSchema).parse(contentElement);

        // Create editor state
        const state = EditorState.create({
            doc,
            plugins: exampleSetup({ schema: resumeSchema }),
        });

        // Create editor view
        const view = new EditorView(editorRef.current, {
            state,
            dispatchTransaction(transaction) {
                const newState = view.state.apply(transaction);
                view.updateState(newState);

                if (onChange && transaction.docChanged) {
                    const serializer = DOMSerializer.fromSchema(resumeSchema);
                    const fragment = serializer.serializeFragment(newState.doc.content);
                    const div = document.createElement('div');
                    div.appendChild(fragment);
                    onChange(div.innerHTML);
                }
            },
        });

        viewRef.current = view;

        return () => {
            view.destroy();
        };
    }, []);

    return (
        <div
            ref={editorRef}
            data-testid="resume-editor"
            className="prose max-w-none border rounded p-4 min-h-[400px]"
        />
    );
}

// Import DOMSerializer for HTML serialization
import { DOMSerializer } from 'prosemirror-model';
