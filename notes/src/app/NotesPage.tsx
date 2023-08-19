'use client';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useConfirm } from 'material-ui-confirm';
import React, { useEffect, useState } from 'react';
import { NewNote, Note } from '../types';
import CreateNoteDialog from './CreateNoteDialog';
import NoteCard from './NoteCard';
import styles from './NotesPage.module.css';

interface HomeProps {
  initialNotes: Note[];
}

/**
 * This hook provides a basic "notes" state variable, but it also:
 * - initializes the notes with a provided initialNotes (just once)
 * - saves/recovers notes from local history
 */
function useNotes(initialNotes: Note[] = []): [Note[], Function] {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  useEffect(() => {
    let notes: Note[] | null = null;
    // Normally notes would be stored in a database. We won't do that, but just to make things a
    // little more realistic, retrieve the notes from local storage (to save them between refreshes)
    try {
      const hasSetInitialNotes = JSON.parse(
        localStorage.getItem('hasSetInitialNotes') as string
      );
      notes = JSON.parse(localStorage.getItem('notes') as string) as Note[];

      // Start with some initial (fake) notes, so we're not looking at a mostly blank screen
      // when we first start
      if (!hasSetInitialNotes && !notes.length) {
        notes = initialNotes;
      }

      // "Hydrate" the notes by converting the date strings back into Date objects;
      notes = notes.map((note) => ({
        ...note,
        createdAt: new Date(note.createdAt),
      }));
      setNotes(notes ?? []);
      localStorage.setItem('hasSetInitialNotes', 'true');
    } catch (err) {}
  }, []);
  useEffect(() => {
    // Whenever the notes change, save the changes in local storage
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);
  return [notes, setNotes];
}

export default function Home({ initialNotes }: HomeProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [noteFilter, setNoteFilter] = useState(''); // The text to filter (search) notes with
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useNotes(initialNotes);

  const confirm = useConfirm();

  const openDialog = () => setShowDialog(true);
  const closeDialog = () => setShowDialog(false);

  const createNote = (note: NewNote) => {
    const createdNote = {
      ...note,
      // Since we're doing this all client-side, generate a random "UUID"
      // NOTE: Using Math.random since crypto librarymay not be available, and using a whole
      //       uuid-generation dependency felt like overkill for this simple assignment
      id: Math.random() + '',
      createdAt: new Date(),
    };
    setNotes([...notes, createdNote]);
  };

  const deleteNote = async (note: Note) => {
    try {
      await confirm({
        description: `Are you certain you want to delete the note "${note.title}"?`,
      });
    } catch (err) {
      console.error(err);
      return;
    }
    setNotes(notes.filter(({ id }) => note.id !== id));
    // If we just deleted the last note on the page, go back to the previous page
    if (notes.length % 6 === 1) setPage(page - 1);
  };

  const filterNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoteFilter(e.target.value);
  };

  const filteredNotes = notes.filter(
    (note: Note) =>
      note.title.toLowerCase().includes(noteFilter.toLowerCase()) ||
      note.text.toLowerCase().includes(noteFilter.toLowerCase())
  );

  const notesIndex = (page - 1) * 6;
  const visibleNotes = filteredNotes.slice(notesIndex, notesIndex + 6);

  return (
    <main>
      <Paper elevation={3} className={styles.paper}>
        <h1>Notes Page</h1>
        {showDialog && (
          <CreateNoteDialog closeDialog={closeDialog} createNote={createNote} />
        )}
        <InputLabel htmlFor="search">Filter Notes</InputLabel>
        <FormControl>
          <TextField
            id="search"
            aria-label="search"
            className={styles.searchField}
            onChange={filterNotes}
            placeholder="Type here to search for notes with specific text"
            value={noteFilter}
          />
        </FormControl>
        <br />
        <br />
        <Stack
          className={styles.cardStack}
          direction="row"
          flexWrap="wrap"
          spacing={2}
          useFlexGap
        >
          {visibleNotes.map((note: Note) => (
            <NoteCard key={note.id} {...{ deleteNote, note }} />
          ))}
        </Stack>
        <div className={styles.bottomArea}>
          <div className={styles.addNoteBox}>
            <Button
              aria-label="create"
              onClick={openDialog}
              startIcon={<AddIcon />}
            >
              Add Note
            </Button>
          </div>
          {!!filteredNotes.length && (
            <div className={styles.paginationBox}>
              <Pagination
                count={Math.ceil(filteredNotes.length / 6)}
                onChange={(_, page) => setPage(page)}
                page={page}
                shape="rounded"
              />
            </div>
          )}
        </div>
      </Paper>
    </main>
  );
}
