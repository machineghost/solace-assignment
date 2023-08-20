# solace-assignment

## How to Run (Development Mode)
1. `git clone git@github.com:machineghost/solace-assignment.git`
2. `npm install`
3. `npm run dev`

## How to Run (Production Mode)
Although this is unlikely to be necessary for this assignment, you can run in production mode by changing step #3 (`npm run dev`) to `npm run build` followed by `npm run start`.

## How to Run Tests
Clone and install as above, then run `npm run test`.

## Technology Stack

**Language:** Typescript - I used a lot of inferred types, but if you want to generate static type files just run `npm run build-types`.

**Server:** None - it wasn't needed for this assignment.
However, the application does use local history to simulate an environment closer to a real (database-using) one.

**Client:** React/Next.js - I chose Next because it's an easy to use and powerful framework.

**Testing:** Jest/Sinon/React Testing Library - I went with this stack for testing just because it's fairly universal, and Next.js has support for Jest out of the box.

**CSS Framework:**  Material UI - A popoular framework that made it easy to create a good-looking API.  I also used another helper package, `material-ui-confirm`, to create a more user-friendly confirmation dialog.

**UI Enhancements:** Although I'm a big believer in coding according to a spec, and these things weren't explicitly mentioned in the requirements, I added them to show off a little

* The note creation is handled inside a dialog box
* The number of characters of a note's text is explicitly displayed, to make it clearer when a user has a too short/long note.
* Notes include a date field and an ID field, which uses a (fake) UUID
* Pagination - the instructions mentioned "indexing", so I created a six-notes-per-page pagination scheme
* While I didn't fully test for a 100% responsive design, the design overall should be responsive and work reasonably well for all screen sizes.

## Questions, Comments, Concerns

If anything doesn't work, or if you have any questions about my code, please let me know.
