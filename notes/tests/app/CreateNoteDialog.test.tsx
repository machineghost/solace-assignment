import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import sinon from 'sinon';
import CreateNoteDialog from '../../src/app/CreateNoteDialog';
import { Providers } from '../../src/app/Providers';
import assert from 'assert';

/**
 * Simulate a backspace keypress inside an input element
 * This is a little trickier than just doing a single fireEvent, because multiple
 * events need to be triggered to simulate it properly
 * @see https://stackoverflow.com/questions/62056922/remove-character-from-behind-using-backspace-fireevent/62101163
 */
const backspace = (element: HTMLInputElement) => {
  let actuallyTyped = element.value;

  const key = 'Backspace';
  const code = 8;
  const inputType = 'deleteContentBackward';

  const sharedEventConfig = { key, charCode: code, keyCode: code, which: code };
  const downEvent = fireEvent.keyDown(element, sharedEventConfig);

  if (downEvent) {
    actuallyTyped = actuallyTyped.slice(0, -1);

    fireEvent.input(element, {
      target: { value: actuallyTyped },
      inputType,
      bubbles: true,
      cancelable: true,
    });
  }

  fireEvent.keyUp(element, sharedEventConfig);
};

/**
 * Simple helper function for typing text into an <input>
 */
const typeInInput = (input: HTMLInputElement, value: string) => {
  fireEvent.keyUp(input, { target: { value } });
  return fireEvent.input(input, { target: { value } });
};

const getPageElements = () => {
  const [titleInputWrapper] = screen.getByLabelText('title').children;
  const titleInput = titleInputWrapper.children[0] as HTMLInputElement;
  const [textInputWrapper] = screen.getByLabelText('text').children;
  const textInput = textInputWrapper.children[0] as HTMLInputElement;
  const cancelButton = screen.getByText('Cancel') as HTMLButtonElement;
  const createButton = screen.getByText('Create Note') as HTMLButtonElement;
  return {
    cancelButton,
    titleInput,
    titleInputWrapper,
    textInput,
    textInputWrapper,
    createButton,
  };
};

/**
 * Renders the dialog component being tested
 */
const renderDialog = ({
  closeDialog = () => {},
  createNote = () => {},
} = {}) => {
  return render(
    <Providers>
      <CreateNoteDialog closeDialog={closeDialog} createNote={createNote} />
    </Providers>
  );
};

describe('CreateNoteDialog', () => {
  // Rect testing library doesn't clear local storage in render, so we have to manually
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it('renders the dialog', async () => {
    renderDialog();
    screen.getByText("Please fill in your note's details.");
  });
  it('shows the title field in error mode after leaving it without a title', () => {
    renderDialog();
    // Material UI wraps inputs inside divs; extract the input and its parent div
    const { titleInput, titleInputWrapper } = getPageElements();

    fireEvent.click(titleInput);
    fireEvent.focus(titleInput);
    fireEvent.blur(titleInput);

    expect(titleInputWrapper.className).toMatch(/Mui-error/);
    screen.getByText('Title must be specified');
  });
  it('shows the text field in error mode after leaving it without enough text', () => {
    renderDialog();
    const { textInput, textInputWrapper } = getPageElements();

    fireEvent.focus(textInput);
    fireEvent.blur(textInput);

    expect(textInputWrapper.className).toMatch(/Mui-error/);
    screen.getByText('Note text must be at least 20 characters.');
  });
  it('shows the text field in error mode after typing but then deleting enough text', async () => {
    renderDialog();
    const { textInput, textInputWrapper } = getPageElements();

    typeInInput(textInput, 'a'.repeat(20));
    fireEvent.blur(textInput);
    backspace(textInput);

    screen.getByText('Note text must be at least 20 characters.');
    expect(textInputWrapper.className).toMatch(/Mui-error/);
  });
  it('shows the text field in error mode after typing too much text', () => {
    renderDialog();
    const { textInput, textInputWrapper } = getPageElements();

    fireEvent.focus(textInput);
    typeInInput(textInput, 'a'.repeat(301));

    screen.getByText('Note text can not exceed 300 characters.');
    expect(textInputWrapper.className).toMatch(/Mui-error/);
  });
  it('updates the text count when the text is updated', () => {
    renderDialog();
    const { textInput } = getPageElements();

    fireEvent.focus(textInput);
    typeInInput(textInput, 'a'.repeat(200));

    screen.getByText('200 / 300', { collapseWhitespace: false });
  });
  it('shows the text count in error mode when the text is invalid', () => {
    renderDialog();
    const { textInput } = getPageElements();

    fireEvent.focus(textInput);
    typeInInput(textInput, 'a'.repeat(301));

    const count = screen.getByText('301 / 300', { collapseWhitespace: false });
    expect(count.className).toMatch(/error/);
  });
  it('disables create note button when there is no title', () => {
    renderDialog();
    const { createButton, textInput, titleInput } = getPageElements();

    expect(createButton.disabled).toBeTruthy();
    typeInInput(textInput, 'a'.repeat(30));
    typeInInput(titleInput, 'A'); // enter a title
    backspace(titleInput); // then delete it
    expect(createButton.disabled).toBeTruthy();
  });
  it('disables create note button when there is inadequate text', () => {
    renderDialog();
    const { createButton, textInput, titleInput } = getPageElements();

    expect(createButton.disabled).toBeTruthy();
    typeInInput(titleInput, 'Fake title');
    typeInInput(textInput, 'not enough text');
    expect(createButton.disabled).toBeTruthy();
  });
  it('enables the create note button when there is a title and adequate text', () => {
    renderDialog();
    const { createButton, textInput, titleInput } = getPageElements();

    expect(createButton.disabled).toBeTruthy();
    typeInInput(textInput, 'a'.repeat(30));
    typeInInput(titleInput, 'A');
    expect(createButton.disabled).toBeFalsy();
  });
  it('closes the dialog when the cancel button is clicked', () => {
    const closeDialog = sinon.stub();
    renderDialog({ closeDialog });
    const { cancelButton } = getPageElements();

    fireEvent.click(cancelButton);
    expect(closeDialog.called).toBeTruthy();
  });
  it('closes the dialog when the create note button is clicked', () => {
    const closeDialog = sinon.stub();
    renderDialog({ closeDialog });
    const { createButton, textInput, titleInput } = getPageElements();

    expect(createButton.disabled).toBeTruthy();
    typeInInput(textInput, 'a'.repeat(30));
    typeInInput(titleInput, 'A');
    expect(createButton.disabled).toBeFalsy();

    fireEvent.click(createButton);
    expect(closeDialog.called).toBeTruthy();
  });
  it('creates a note when the create note button is clicked', async () => {
    const createNote = sinon.stub();
    renderDialog({ createNote });
    const { createButton, textInput, titleInput } = getPageElements();

    typeInInput(titleInput, 'A');
    typeInInput(textInput, 'a'.repeat(30));
    fireEvent.click(createButton);

    expect(createNote.called).toBeTruthy();
    const { args } = createNote.getCall(0);
    expect(args[0]).toEqual({ title: 'A', text: 'a'.repeat(30) });
  });
});
