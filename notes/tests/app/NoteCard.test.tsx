import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import assert from 'assert';
import sinon from 'sinon';
import NoteCard from '../../src/app/NoteCard';
import { Providers } from '../../src/app/Providers';
import { initialNotes } from '../../src/app/page';
import { Note } from '../../src/types';

const [initialNote] = initialNotes;

const renderNoteCard = (note: Note, fakeDeleteNote: Function) => {
  return render(
    <Providers>
      <NoteCard deleteNote={fakeDeleteNote} note={note} />
    </Providers>
  );
};

describe('NoteCard', () => {
  let deleteCardStub = sinon.stub();
  beforeEach(() => {
    // Rect testing library doesn't clear local storage in render, so we have to manually
    window.localStorage.clear();
  });
  afterEach(cleanup);

  it('renders a note card', async () => {
    renderNoteCard(initialNote, deleteCardStub);
    await waitFor(() => screen.queryByText(initialNote.title));
    screen.getByText(initialNote.text);
  });

  it('calls delete card function when button is pressed', async () => {
    const { queryByText } = renderNoteCard(initialNote, deleteCardStub);

    expect(queryByText('Are you sure?')).toBeFalsy();
    const deleteButton = screen.getByTestId('DeleteIcon').parentElement;

    assert(deleteButton);
    fireEvent.click(deleteButton, new MouseEvent('click', { bubbles: true }));

    expect(deleteCardStub.called).toBeTruthy();
  });
});
