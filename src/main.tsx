import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { InvoiceComplianceGuide } from './components/InvoiceComplianceGuide.tsx';
import { GettingPaidGuide } from './components/GettingPaidGuide.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/guide/compliance" element={<InvoiceComplianceGuide />} />
        <Route path="/guide/getting-paid" element={<GettingPaidGuide />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
