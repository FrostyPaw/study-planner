# Study Planner

Web Programming Laboratory Work 2, Variant 10: a React application for organising university assignments. Each task has a subject, deadline and estimated duration.

## Run locally

Install Node.js with npm first. The project was developed with Node.js 24.21.0 and npm 11.19.0. The dependency versions are recorded in package-lock.json.

Download and extract this repository, or clone it. Open a terminal in the project directory containing package.json and run:

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal, normally [http://localhost:5173/](http://localhost:5173/). Keep the terminal open while using the app. Stop the server with Ctrl+C.

The initial dependency installation needs an internet connection. After installation, the application uses local files and does not load external fonts, images or APIs.

## Features

- Add assignments with a title, subject, deadline and estimated time of 5–600 whole minutes.
- View all tasks, mark them completed, return them to active status and delete them.
- Filter the list with All, Active and Completed buttons.
- Save additions, completion changes and deletions in browser localStorage.
- Display the number of active assignments and their total estimated time.
- Highlight unfinished tasks with a deadline before the current local date. A deadline today is not overdue.
- Animate task rows when they appear; respect the reduced-motion preference.
- Validate form values and saved data. Show a message if browser storage cannot be read or written.

The workload summary always describes all assignments, independently of the selected filter. Completed tasks do not contribute to the remaining time. Adding a task switches the list to All so that the new task is visible.

## Saved tasks

Tasks are saved in the current browser profile for the current origin (scheme, host and port). Return using the same browser and address to see the same list. For example, localhost:5173, 127.0.0.1:5173 and localhost:4173 have separate storage.

Task data stays in the browser; downloading this repository on another computer starts a separate list. Clearing site data removes saved tasks. After a page reload, the selected filter returns to All, while tasks and their completion status are restored.

If saved data cannot be read or fails validation, the app preserves it without overwriting it and displays a warning. Newly entered tasks are then available only while that page remains open. If writing fails, the app reports that the current list was not saved.

## Build and code checks

```sh
npm run build
npm run lint
```

The build command creates the production files in dist. The lint command checks the source with Oxlint. Generated dist and installed node_modules are excluded from Git.

## Manual verification

1. Add two assignments estimated at 60 and 45 minutes. The total should be 1 h 45 min.
2. Give the 45-minute assignment a deadline before today. It should be marked Overdue.
3. Mark that assignment completed. The remaining time should become 1 h, and it should no longer be overdue.
4. Check the All, Active and Completed filters.
5. Reload the page. Tasks and their completion status should remain.
6. Delete one assignment, then reload. The deleted assignment should stay deleted.
7. Try an empty form, a title containing only spaces, and time values below 5, above 600 or containing a fraction. Invalid values should be rejected.
8. Give a task today's deadline. It should not be overdue.
9. Narrow the browser window. The form and list should stack vertically.

## Main files

```text
src/App.jsx       Interface, React state and user actions
src/taskUtils.js  Saved-data validation, storage, filters and calculations
src/App.css       Layout, task states, responsive styles and animation
src/index.css     General page styles
src/main.jsx      React entry point
index.html        Page metadata and root element
vite.config.js    Vite configuration
```

## Versions

| Version | Changes |
| --- | --- |
| 0.0.0 | Official Vite React starter, saved as the initial commit. |
| 1.0.0 | Coursework form, task list, completion and deletion, and custom layout. |
| 1.1.0 | Saved tasks, filters, remaining workload, overdue badges, clearer time label and task animation. |

Version numbers use MAJOR.MINOR.PATCH: a major version for incompatible changes, a minor version for compatible features, and a patch version for compatible bug fixes.

## Development and references

The project is based on the official Vite React starter. Features were implemented and tested incrementally, with changes recorded in the Git history.

- [React documentation](https://react.dev/learn)
- [Vite documentation](https://vite.dev/guide/)
- [npm ci documentation](https://docs.npmjs.com/cli/v11/commands/npm-ci/)
- [Browser localStorage documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

