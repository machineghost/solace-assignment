'use client';
import { NewNote, Note } from '@/typings';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useConfirm } from 'material-ui-confirm';
import React, { MouseEventHandler, useEffect, useState } from 'react';
import CreateNoteDialog from './CreateNoteDialog';
import NoteCard from './NoteCard';
import Pagination from '@mui/material/Pagination';
import { Card } from '@mui/material';
import styles from './NotesPage.module.css';

interface HomeProps {
  initialNotes: Note[];
}
export default function Home({ initialNotes }: HomeProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [noteFilter, setNoteFilter] = useState(''); // The text to filter (search) notes with
  const [notes, setNotes] = useState<Note[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let notes: Note[] | null = null;
    // Normally notes would be stored in a database. We won't do that, but just to make things a
    // little more realistic, retrieve the notes from local storage (to save them between refreshes)
    try {
      notes = JSON.parse(localStorage.getItem('notes') as string) as Note[];
      // "Hydrate" the notes by converting the date strings back into Date objects;
      notes = notes.map((note) => ({
        ...note,
        createdAt: new Date(note.createdAt),
      }));
    } catch (err) {}

    // If we can't get any notes from localstorage, fallback to the fake initial notes
    setNotes(notes?.length ? notes : initialNotes);
  }, []);

  useEffect(() => {
    // Whenever the notes change, save the changes in local storage
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const confirm = useConfirm();

  const openDialog = () => setShowDialog(true);
  const closeDialog = () => setShowDialog(false);

  const createNote = (note: NewNote) => {
    const createdNote = {
      ...note,
      // Since we're doing this all client-side, generate a random UUID
      id: crypto.randomUUID(),
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
        <CreateNoteDialog
          closeDialog={closeDialog}
          createNote={createNote}
          isVisible={showDialog}
        />
        <InputLabel htmlFor="search">Filter Notes</InputLabel>
        <FormControl>
          <TextField
            id="search"
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
          {filteredNotes.length > visibleNotes.length && (
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
