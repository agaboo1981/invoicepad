import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          freelancerInvoiceGenerator: path.resolve(__dirname, 'freelancer-invoice-generator.html'),
          consultantInvoiceTemplate: path.resolve(__dirname, 'consultant-invoice-template.html'),
          invoiceGeneratorIndia: path.resolve(__dirname, 'invoice-generator-india.html'),
          invoiceTemplateGuide: path.resolve(__dirname, 'invoice-template-guide.html'),
          invoiceGeneratorUsa: path.resolve(__dirname, 'invoice-generator-usa.html'),
          invoiceGeneratorUk: path.resolve(__dirname, 'invoice-generator-uk.html'),
          invoiceGeneratorCanada: path.resolve(__dirname, 'invoice-generator-canada.html'),
          selfEmployedInvoiceTemplate: path.resolve(__dirname, 'self-employed-invoice-template.html'),
          hourlyInvoiceTemplate: path.resolve(__dirname, 'hourly-invoice-template.html'),
          contractorInvoiceGenerator: path.resolve(__dirname, 'contractor-invoice-generator.html'),
          about: path.resolve(__dirname, 'about.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          privacyPolicy: path.resolve(__dirname, 'privacy-policy.html'),
          termsOfService: path.resolve(__dirname, 'terms-of-service.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
