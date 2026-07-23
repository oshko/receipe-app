// Vercel entry point.
//
// An Express app *is* a (req, res) function, which is exactly the signature
// Vercel's Node runtime expects from a serverless function — so it can be
// exported directly with no adapter. vercel.json rewrites every /api/* request
// to this one file, and Express does the routing from there.
export { default } from '../server/app.js';
