// Vite as a dev server (file watcher + live-reload) for the legacy
// global-scope codebase. appType: 'mpa' tells Vite to treat index.html
// as plain HTML (no SPA routing), so non-module <script src> tags are
// served as static assets rather than transformed as ESM.
//
// Prod bundling does NOT go through Vite (see build.js). Eventual
// SolidJS/Lit + TypeScript migration will move prod here too.
export default {
	root: '.',
	publicDir: false,
	appType: 'mpa',
	server: {
		port: 8765,
		open: false,
	},
};
