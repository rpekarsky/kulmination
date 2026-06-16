// Vite as a dev server (file watcher + live-reload) for the legacy
// global-scope codebase. appType: 'mpa' tells Vite to treat index.html
// as plain HTML (no SPA routing), so non-module <script src> tags are
// served as static assets rather than transformed as ESM.
//
// /api/* is proxied to the Worker — by default a local `wrangler dev`
// on :8787, but settable to the prod CF deployment via env var when
// the frontend needs to be tested against live leaderboard data:
//
//   npm start                                        → proxy to :8787
//   VITE_API_PROXY=https://play.kulmination.app npm start  → proxy to prod
//
// Prod bundling does NOT go through Vite (see build.js). Eventual
// SolidJS/Lit + TypeScript migration will move prod here too.
const API_PROXY = process.env.VITE_API_PROXY || 'http://localhost:8787';

export default {
	root: '.',
	publicDir: false,
	appType: 'mpa',
	server: {
		port: 8765,
		open: false,
		proxy: {
			'/api': {
				target: API_PROXY,
				changeOrigin: true,
				secure: true,
			},
		},
	},
};
