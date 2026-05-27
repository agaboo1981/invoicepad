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

const redirects = {
  '/about.html': '/',
  '/consultant-invoice-template.html': '/',
  '/contact.html': '/',
  '/contractor-invoice-generator.html': '/',
  '/freelancer-invoice-generator.html': '/',
  '/hourly-invoice-template.html': '/',
  '/invoice-generator-canada.html': '/',
  '/invoice-generator-india.html': '/',
  '/invoice-generator-uk.html': '/',
  '/invoice-generator-usa.html': '/',
  '/invoice-template-guide.html': '/',
  '/privacy-policy.html': '/',
  '/self-employed-invoice-template.html': '/',
  '/terms-of-service.html': '/'
};

Object.keys(redirects).forEach(path => {
  app.get(path, (req, res) => {
    res.redirect(301, redirects[path]);
  });
});

app.use(express.static(distPath, {extensions: ['html']}));

app.use((_req, res) => {
  res.status(404).json({error: 'Not Found'});
});

app.listen(port, () => {
  console.log(`InvoicePad server listening on port ${port}`);
});
