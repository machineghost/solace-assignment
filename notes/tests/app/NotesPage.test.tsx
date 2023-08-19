import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import NotesPage from '../../src/app/NotesPage';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { initialNotes } from '../../src/app/page';
import assert from 'assert';
import { Providers } from '../../src/app/Providers';
import { Note } from '../../src/types';

const [initialNote] = initialNotes;

const renderPage = (initialNotes: Note[]) =>
  render(
    <Providers>
      <NotesPage initialNotes={initialNotes} />
    </Providers>
  );

describe('NotesPage', () => {
  // For tests that need to test having 7 notes
  const sevenNotes = [
    initialNote,
    { ...initialNote, id: '1', text: 'abcdefghihjklmnopqrstuvwxyz' },
    { ...initialNote, id: '2', text: 'abcdefghihjklmnopqrstuvwxy2' },
    { ...initialNote, id: '3', text: 'abcdefghihjklmnopqrstuvwxy3' },
    { ...initialNote, id: '4', text: 'abcdefghihjklmnopqrstuvwxy4' },
    { ...initialNote, id: '5', text: 'abcdefghihjklmnopqrstuvwxy5' },
    { ...initialNote, id: '6', text: 'abcdefghihjklmnopqrstuvwxy6' },
  ];
  // Rect testing library doesn't clear local storage in render, so we have to manually
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);
  it('loads notes from local history', async () => {
    renderPage(initialNotes);
    await waitFor(() => screen.queryByText(initialNote.title));
    screen.getByText(initialNote.text);
  });

  it('opens create dialog when button is pressed', async () => {
    renderPage(initialNotes);
    fireEvent.click(screen.getByText('Add Note'));

    // Expect to see the dialog's fields/buttons
    screen.getByLabelText('title');
    screen.getByLabelText('text');
    screen.getByRole('button', { name: 'Create Note' });
    screen.getByRole('button', { name: 'Cancel' });
  });

  it('displays all notes when there is no filter', async () => {
    renderPage(initialNotes);
    const searchInput = screen.getByLabelText('search').querySelector('input');

    assert(searchInput);
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => screen.queryByText(initialNote.title));
    screen.getByText(initialNote.text);
  });

  it('only displays matching notes when a filter is specified', async () => {
    renderPage(initialNotes);
    const searchInput = screen.getByLabelText('search').querySelector('input');

    assert(searchInput);
    fireEvent.change(searchInput, { target: { value: 'abcdefg' } });

    await waitFor(() => screen.queryByText(initialNote.title));
    expect(screen.queryByText(initialNote.text)).toBeNull();
  });

  it('only displays 6 notes at a time', () => {
    const notesPage = renderPage(sevenNotes);
    notesPage.getByText(sevenNotes[0].text);
    notesPage.getByText(sevenNotes[1].text);
    notesPage.getByText(sevenNotes[2].text);
    notesPage.getByText(sevenNotes[3].text);
    notesPage.getByText(sevenNotes[4].text);
    notesPage.getByText(sevenNotes[5].text);
    expect(notesPage.queryByText(sevenNotes[6].text)).toBeNull();
  });
  it('shows pagination controls if there are 7+ notes', () => {
    const notesPage = renderPage(sevenNotes);
    screen.getByLabelText('pagination navigation');
  });
  it('shows pagination controls even if there is only one note', () => {
    renderPage(initialNotes);
    screen.getByLabelText('pagination navigation');
  });
  it('does not show pagination controls when there are no notes', () => {
    renderPage([]);
    expect(screen.queryByLabelText('pagination navigation')).toBeNull();
  });
  it('opens delete dialog when button is pressed', async () => {
    const { getByText, queryByText } = renderPage(initialNotes);

    expect(queryByText('Are you sure?')).toBeFalsy();
    const deleteButton = screen.getByTestId('DeleteIcon').parentElement;

    assert(deleteButton);
    fireEvent.click(deleteButton, new MouseEvent('click', { bubbles: true }));

    await waitFor(() => getByText('Are you sure?'));
    screen.getByText(
      `Are you certain you want to delete the note "Nancy's Visit Notes"?`
    );
  });
});
