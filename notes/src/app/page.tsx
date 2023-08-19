import { Note } from '../types';
import NotesPage from './NotesPage';
import { Providers } from './Providers';

// Exported for use in testing
export const initialNotes: Note[] = [
  {
    // NOTE: Using Math.random since crypto librarymay not be available, and using a whole
    //       uuid-generation dependency felt like overkill for this simple assignment
    id: Math.random() + '',
    title: `Nancy's Visit Notes`,
    text:
      `Per your doctor's instructions, take two green Placebium pills every morning ` +
      `with breakfast, and one white Fakeidote pill at bedtime.`,

    // Let's pretend this fake note was created two days ago
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2),
  },
];

export default () => {
  // Normally we would fetch the notes from a web API, database, etc. here,
  // but since this is a contrived assignment, just pass a fixed array
  return (
    <Providers>
      <NotesPage initialNotes={initialNotes} />
    </Providers>
  );
};
