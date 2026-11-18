// Vercel runs the API as one serverless function: vercel.json sends every path here, and
// Express routes it as usual. dist/ is the compiled API from `npm run build`.
import app from "../dist/app.js";

export default app;
