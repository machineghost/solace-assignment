import { Note } from '@/typings';
import DeleteIcon from '@mui/icons-material/Delete';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import styles from './NoteCard.module.css';

// NOTE: Normally I'd use a library (eg. date-fns) for date formatting, but since this is such a
//       simple case I figured: why add a dependency?
const formatDate = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

interface NoteCardProps {
  deleteNote: Function;
  note: Note;
}

export default function NoteCard({ deleteNote, note }: NoteCardProps) {
  const deleteThisNote = () => deleteNote(note);

  return (
    <Card>
      <CardHeader
        title={
          <div className={styles.title}>
            {note.title} <DeleteIcon onClick={deleteThisNote} />
          </div>
        }
        action={<span>{formatDate(note.createdAt)}</span>}
      />
      <div>{note.text}</div>
    </Card>
  );
}
