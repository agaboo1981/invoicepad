import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';

const app = express();
const port = Number(process.env.PORT) || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

app.get('/health', (_req, res) => {
  res.status(200).json({status: 'ok'});
});

app.use(express.static(distPath, {extensions: ['html']}));

app.use((_req, res) => {
  res.status(404).json({error: 'Not Found'});
});

app.listen(port, () => {
  console.log(`InvoicePad server listening on port ${port}`);
});
