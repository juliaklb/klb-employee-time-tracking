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

## Deploying on Netlify

### Drag-and-drop deployment

1. Sign in to Netlify and open **Add new project → Deploy manually**.
2. Drag the unzipped `grant-tracker` folder into the deployment area. You may also upload the Netlify-ready ZIP supplied with this project.
3. Netlify should publish the site without a build command.

### Deploying from GitHub

1. Upload the **contents** of this folder to the root of your GitHub repository. `index.html` and `netlify.toml` must appear at the repository's top level, not inside another folder or ZIP file.
2. In Netlify, choose **Add new project → Import an existing project** and select the repository.
3. Leave the build command blank. The publish directory is already set to `.` in `netlify.toml`.
4. Deploy the site.

If Netlify shows **Page not found**, confirm that `index.html` is at the published directory's root. If Netlify reports a failed build, clear any build command saved in the Netlify project settings and redeploy.

## Hosting on GitHub Pages

Upload the contents of this folder to a GitHub repository. In the repository, open **Settings → Pages**, select **Deploy from a branch**, choose the branch and root folder, then save. Keep the repository private if the client data is confidential. Note that GitHub Pages sites may have visibility implications depending on your plan and repository settings.

## File structure

- `index.html` – application layout
- `styles.css` – responsive, accessible styling
- `app.js` – filtering, editing, storage, import, and export features
- `data/grants.js` – imported workbook records
- `netlify.toml` – Netlify publish and security-header configuration
