'use client';

import { useEffect, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

type CockpitBlockNoteEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

function normalizeMarkdown(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function CockpitBlockNoteEditor({
  value,
  onChange,
}: CockpitBlockNoteEditorProps) {
  const syncingRef = useRef(false);

  const editor = useCreateBlockNote({
    initialContent: [{ type: 'paragraph', content: value || '' }],
  });

  useEffect(() => {
    const current = editor.blocksToMarkdownLossy(editor.document);

    if (normalizeMarkdown(current) === normalizeMarkdown(value)) {
      return;
    }

    syncingRef.current = true;
    const blocks = editor.tryParseMarkdownToBlocks(value || '');
    editor.replaceBlocks(
      editor.document,
      blocks.length > 0 ? blocks : [{ type: 'paragraph', content: '' }],
    );
    syncingRef.current = false;
  }, [editor, value]);

  return (
    <BlockNoteView
      editor={editor}
      className="min-h-[220px] rounded-[16px] border border-white/10 bg-black/40 px-2 py-2 text-white"
      onChange={() => {
        if (syncingRef.current) {
          return;
        }
        onChange(editor.blocksToMarkdownLossy(editor.document).trim());
      }}
    />
  );
}
