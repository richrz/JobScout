'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Plus, Save, Trash2 } from 'lucide-react';

interface Note {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface NotesEditorProps {
    workspaceId: string;
}

export function NotesEditor({ workspaceId }: NotesEditorProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState<Record<string, string>>({});
    const [newNoteContent, setNewNoteContent] = useState('');

    useEffect(() => {
        fetchNotes();
    }, [workspaceId]);

    const fetchNotes = async () => {
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/notes`);
            const data = await res.json();
            setNotes(data.notes || []);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const createNote = async () => {
        if (!newNoteContent.trim()) return;

        try {
            const res = await fetch(`/api/workspace/${workspaceId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newNoteContent })
            });
            const data = await res.json();
            setNotes([data.note, ...notes]);
            setNewNoteContent('');
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    };

    const updateNote = async (noteId: string) => {
        const content = editedContent[noteId];
        if (!content?.trim()) return;

        setSaving(noteId);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/notes/${noteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const data = await res.json();
            setNotes(notes.map(n => n.id === noteId ? data.note : n));
            // Clear edited state
            const { [noteId]: _, ...rest } = editedContent;
            setEditedContent(rest);
        } catch (error) {
            console.error('Failed to update note:', error);
        } finally {
            setSaving(null);
        }
    };

    const deleteNote = async (noteId: string) => {
        try {
            await fetch(`/api/workspace/${workspaceId}/notes/${noteId}`, {
                method: 'DELETE'
            });
            setNotes(notes.filter(n => n.id !== noteId));
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const handleEdit = (noteId: string, content: string) => {
        setEditedContent({ ...editedContent, [noteId]: content });
    };

    const hasEdits = (noteId: string) => {
        const original = notes.find(n => n.id === noteId)?.content;
        return editedContent[noteId] !== undefined && editedContent[noteId] !== original;
    };

    if (loading) {
        return <p className="text-muted-foreground">Loading notes...</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">War Room Notes</h3>
            </div>

            {/* New Note Input */}
            <GlassCard className="p-4">
                <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Add a new note... (Markdown supported)"
                    className="w-full min-h-[100px] bg-transparent border-none resize-none text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="flex justify-end mt-2">
                    <Button
                        variant="glow"
                        size="sm"
                        onClick={createNote}
                        disabled={!newNoteContent.trim()}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Note
                    </Button>
                </div>
            </GlassCard>

            {/* Existing Notes */}
            <div className="space-y-4">
                {notes.map((note) => (
                    <GlassCard key={note.id} className="p-4">
                        <textarea
                            value={editedContent[note.id] ?? note.content}
                            onChange={(e) => handleEdit(note.id, e.target.value)}
                            className="w-full min-h-[80px] bg-transparent border-none resize-none text-foreground focus:outline-none"
                        />
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">
                                Last updated: {new Date(note.updatedAt).toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                                {hasEdits(note.id) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateNote(note.id)}
                                        disabled={saving === note.id}
                                    >
                                        <Save className="w-4 h-4 mr-1" />
                                        {saving === note.id ? 'Saving...' : 'Save'}
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteNote(note.id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {notes.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-8">
                    No notes yet. Add your first note above to track your progress!
                </p>
            )}
        </div>
    );
}
