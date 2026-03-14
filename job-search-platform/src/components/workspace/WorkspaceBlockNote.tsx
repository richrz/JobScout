'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

type WorkspaceBlockNoteProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
};

function normalizeMarkdown(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Universal workspace BlockNote editor.
 * Used for stage notes across all pipeline stages.
 * Supports slash commands, block reordering, and rich inline formatting.
 */
export function WorkspaceBlockNote({
  value,
  onChange,
  placeholder = 'Start typing, or use / for commands…',
  minHeight = 180,
}: WorkspaceBlockNoteProps) {
  const syncingRef = useRef(false);

  const editor = useCreateBlockNote({
    initialContent: value
      ? undefined
      : [{ type: 'paragraph', content: placeholder ? '' : '' }],
    ...(value
      ? {}
      : {}),
  });

  // Sync external value changes into the editor
  useEffect(() => {
    if (!value) return;
    const current = editor.blocksToMarkdownLossy(editor.document);
    if (normalizeMarkdown(current) === normalizeMarkdown(value)) return;

    syncingRef.current = true;
    const blocks = editor.tryParseMarkdownToBlocks(value);
    editor.replaceBlocks(
      editor.document,
      blocks.length > 0 ? blocks : [{ type: 'paragraph', content: '' }],
    );
    syncingRef.current = false;
  }, [editor, value]);

  const handleChange = useCallback(() => {
    if (syncingRef.current) return;
    onChange(editor.blocksToMarkdownLossy(editor.document).trim());
  }, [editor, onChange]);

  return (
    <div
      style={{ minHeight }}
      className="workspace-blocknote-wrapper"
    >
      <BlockNoteView
        editor={editor}
        className="rounded-[12px] border border-white/8 bg-black/30 px-2 py-2 text-white"
        onChange={handleChange}
        theme="dark"
      />
      <style>{`
        .workspace-blocknote-wrapper .bn-container {
          --bn-colors-editor-background: transparent;
          --bn-colors-editor-text: rgba(255,255,255,0.85);
          --bn-colors-menu-background: rgba(15,19,28,0.98);
          --bn-colors-menu-text: rgba(255,255,255,0.85);
          --bn-colors-hovered-background: rgba(255,255,255,0.06);
          --bn-colors-selected-background: rgba(255,255,255,0.1);
          --bn-colors-disabled-text: rgba(255,255,255,0.25);
          --bn-colors-border: rgba(255,255,255,0.08);
          --bn-font-family: Inter, system-ui, -apple-system, sans-serif;
          font-size: 14px;
        }
        .workspace-blocknote-wrapper .bn-editor {
          padding: 8px 4px;
        }
        .workspace-blocknote-wrapper [data-content-type="paragraph"] {
          margin: 2px 0;
        }
      `}</style>
    </div>
  );
}
