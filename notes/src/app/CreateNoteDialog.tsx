import { NewNote, Note } from '@/typings';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
  TextField,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import {
  FormEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useState,
} from 'react';
import styles from './CreateNoteDialog.module.css';

const validateText = (text: string) => {
  if (text.length < 20) return `must be at least 20 characters.`;
  if (text.length > 300) return `can not exceed 300 characters.`;
  return '';
};

const validateTitle = (title: string) => {
  // NOTE: The instructions didn't say anything about limiting title length, but it probably doesn't
  //       make sense to let titles be longer than the text itself.  In real life I'd check with my
  //       PM for something like this, but since I don't have one, I just set an arbirtrary max
  //       title length of 50 characters
  if (title.length > 50) return `can not exceed 50 characters.`;
  return title ? '' : 'must be specified';
};

interface NoteFormProps {
  closeDialog: () => void;
  createNote: (note: NewNote) => void;
  isVisible: boolean;
}

const initialNoteState = { title: '', text: '' };

// Helper hook for determining whether we're in mobile (<=500px) view or not
const useIsMobile = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    window.addEventListener('resize', () => setWidth(window.innerWidth));
    return () => {
      window.removeEventListener('resize', () => setWidth(window.innerWidth));
    };
  }, []);

  return width <= 500;
};

const NoteForm = ({ closeDialog, createNote, isVisible }: NoteFormProps) => {
  // Track when the user has interacted with the form elements, so that we don't show error messages
  // before they've even started using them
  const [shouldValidate, setShouldValidate] = useState({
    title: false,
    text: false,
  });
  const [note, setNote] = useState(initialNoteState);
  const isMobile = useIsMobile();

  useEffect(() => {
    // When the dialog is closed, reset the note state
    if (!isVisible) setNote(initialNoteState);
  }, [isVisible]);

  const startValidatingText = () =>
    setShouldValidate({ ...shouldValidate, text: true });

  const startValidatingTitle: FormEventHandler = (e) => {
    setShouldValidate({ ...shouldValidate, title: true });
  };

  // NOTE: The Material UI TextField is technically a div, but it hooks its event handlers up
  //       up to the TextArea inside of it ... thus the type disconnect on these next two lines
  const handleTitleKeyUp: KeyboardEventHandler<HTMLDivElement> = (e) => {
    const title = (e.target as HTMLTextAreaElement).value;
    setNote({ ...note, title });
    setShouldValidate({ ...shouldValidate, title: true });
  };
  const handleTextKeyUp: KeyboardEventHandler<HTMLDivElement> = (e) => {
    const text = (e.target as HTMLTextAreaElement).value;
    setNote({ ...note, text });

    // Once the user has typed at least 20 characters (but then deletes some), we can start telling
    // them they've typed too few characters
    if (text.length > 20) setShouldValidate({ ...shouldValidate, text: true });
  };

  const errors = {
    text: validateText(note.text),
    title: validateTitle(note.title),
  };
  const hasErrors: boolean = !!(errors.text || errors.title);

  const displayedErrors = {
    title: shouldValidate.title && errors.title,
    text: shouldValidate.text && errors.text,
  };

  const attemptToCreateNote = () => {
    // Once the user tries to submit the form, they'll want to see validation errors
    setShouldValidate({ title: true, text: true });
  };

  const createNoteAndCloseDialog = () => {
    if (hasErrors) return;

    createNote(note);
    closeDialog();
  };

  return (
    // Let the dialog fill the screen on mobile, but not on larger screens
    <Dialog fullScreen={isMobile} open={isVisible} onClose={closeDialog}>
      <DialogTitle>Create Note</DialogTitle>
      <form className={styles.form}>
        <DialogContent>
          <DialogContentText className={styles.spaceBelow}>
            Please fill in your note's details.
          </DialogContentText>
          <FormControl className={styles.spaceBelow}>
            <TextField
              id="title"
              aria-describedby="title"
              error={!!displayedErrors.title}
              onBlur={startValidatingTitle}
              onKeyUp={handleTitleKeyUp}
            />
            <FormHelperText error={!!displayedErrors.title}>
              Title{displayedErrors.title && ' ' + displayedErrors.title}
            </FormHelperText>
          </FormControl>
          <FormControl fullWidth>
            <TextField
              id="text"
              aria-describedby="text"
              error={!!displayedErrors.text}
              multiline
              // If the user has focused the textarea and left, we can show validationerrors
              onBlur={startValidatingText}
              onKeyUp={handleTextKeyUp}
              rows={3}
            />
            <div className={styles.textLabelBox}>
              <FormHelperText
                id="text-helper-text"
                error={!!displayedErrors.text}
              >
                Note text{displayedErrors.text && ' ' + displayedErrors.text}
              </FormHelperText>
              <DialogContentText
                className={displayedErrors.text ? styles.error : ''}
              >
                {note.text.length} / 300
              </DialogContentText>
            </div>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog as MouseEventHandler}>Cancel</Button>
          {/* When the button is disabled it won't trigger click events, but the user might still
              click on a disabled button (and want feedback), so we use a wrapper div to catch
              the click event. */}
          <div onClick={attemptToCreateNote}>
            <Button disabled={hasErrors} onClick={createNoteAndCloseDialog}>
              Create Note
            </Button>
          </div>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NoteForm;
