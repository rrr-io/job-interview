# job-interview

Something silly because I'ma silly engene. You can find it live at https://jobinterview.rrriooo.com. 

React + Vite.

## Run locally

Requires Node 22.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # preview the build
```

## Deploy

Every push to `main` builds the site and uploads `dist/` to `/srv/jobinterview/` on the server via GitHub Actions.