# Grant Tracker

A dependency-free grant tracking dashboard populated from `Grant Map_ Active Clients(1).xlsx`.

## Start

1. Unzip the folder.
2. Open `index.html` in a modern browser such as Chrome, Edge, Firefox, or Safari.

No installation, terminal, web server, account, or internet connection is required.

## Features

- 38 client profiles and 318 grant records from the source workbook
- Search and filter by client, year, submission status, and outcome
- Add, edit, and delete records
- Summary totals that update with active filters
- CSV export for reporting or spreadsheet analysis
- JSON backup and restore
- Responsive keyboard-accessible interface

## Data and privacy

The original workbook data is stored in `data/grants.js`. Edits made in the app are stored in the browser's local storage and do not change that seed file. Data is not sent to a server.

Use **Download backup** regularly. To move the tracker to another browser or computer, download a JSON backup and use **Restore backup** in the new browser.

Use **Reset workbook data** to discard browser edits and return to the original imported records.

## Hosting on GitHub Pages

Upload the contents of this folder to a GitHub repository. In the repository, open **Settings → Pages**, select **Deploy from a branch**, choose the branch and root folder, then save. Keep the repository private if the client data is confidential. Note that GitHub Pages sites may have visibility implications depending on your plan and repository settings.

## File structure

- `index.html` – application layout
- `styles.css` – responsive, accessible styling
- `app.js` – filtering, editing, storage, import, and export features
- `data/grants.js` – imported workbook records
