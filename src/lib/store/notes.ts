import type { Note } from "../types"
import { getData, saveData } from "./core"

export function getNotes(): Note[] {
  const data = getData()
  return [...data.notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
}

export async function createNote(title: string, content: string, tournament_id?: string): Promise<Note> {
  const data = getData()
  const note: Note = {
    id: crypto.randomUUID(), tournament_id, title, content, pinned: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }
  data.notes.push(note)
  await saveData(data)
  return note
}

export async function updateNote(id: string, updates: Partial<Pick<Note, "title" | "content" | "pinned">>): Promise<Note | null> {
  const data = getData()
  const idx = data.notes.findIndex((n) => n.id === id)
  if (idx === -1) return null
  data.notes[idx] = { ...data.notes[idx], ...updates, updated_at: new Date().toISOString() }
  await saveData(data)
  return data.notes[idx]
}

export async function deleteNote(id: string) {
  const data = getData()
  data.notes = data.notes.filter((n) => n.id !== id)
  await saveData(data)
}
