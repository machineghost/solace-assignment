import { Note } from '@/typings';
import NotesPage from './NotesPage';
import { Providers } from './Providers';

const initialNotes: Note[] = [
  {
    id: crypto.randomUUID(),
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
