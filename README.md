# QuickInvoice

A modern, highly-polished, and fully offline professional invoice generator built natively for the web. Generate pixel-perfect, clean, and customizable invoices right from your browser - no servers, no logins, no data tracking.

<div align="center">
  <h3><strong><a href="https://quickinvoice.example">Live Demo</a></strong></h3>
</div>

---

## 📖 Table of Contents

- [Vision & Philosophy](#vision--philosophy)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Core Features](#core-features)
- [The PDF Engine](#the-pdf-engine)
- [Internationalization (i18n)](#internationalization-i18n)
- [Development Setup](#development-setup)
- [Data Privacy & Security](#data-privacy--security)
- [Contributing](#contributing)

---

## 🎯 Vision & Philosophy

Most invoice generators fall into one of two traps: they either require you to sign up for a SaaS platform (and thus give up your client's data), or they are clunky, server-rendered applications that produce poorly formatted PDFs.

**QuickInvoice** was built to solve this by providing a premium, native-feeling application that lives entirely in your browser. 

- **Local-First**: The database is your browser's local storage engine.
- **Client-Side Compute**: All math, tax calculations, and PDF generation happen on your machine.
- **Architectural Honesty**: What you see is what you get. No hidden telemetry, no hidden dependencies.

## 🛠️ Architecture & Tech Stack

QuickInvoice is built on a modern, ultra-fast frontend stack designed for maximum portability and zero-config deployment.

- **Framework**: React 18
- **TypeScript**: Strict mode enabled for comprehensive type safety.
- **Styling**: Tailwind CSS v4 for utility-first styling and unified design tokens.
- **Build Tool**: Vite for native ES modules and lightning-fast HMR.
- **Icons**: Lucide React for consistent, crisp SVG iconography.
- **PDF Generation**: Native vector-based PDF rendering using `jsPDF` and `jspdf-autotable`.

## ✨ Core Features

* **Blazing Fast Local-First State**: Your data never leaves your browser. State synchronization happens completely on the local storage engine with zero latency.
* **Auto-CalculationsEngine**: The engine dynamically totals your line items and adjusts for multi-rate tax systems and discounting schemas (inclusive/exclusive modes supported).
* **Dynamic Quick Actions**:
  * Live, side-by-side preview syncing
  * Direct logo image imports via base64 encoding (stays entirely local!).
  * Automatic QR code generation for payment processing.
* **Responsive Dark Mode Toolkit**: Built-in adaptive dark mode supporting both system-level triggers and manual overrides.
* **Offline Ready**: By design, once loaded, the application requires zero network requests to function.

## 📄 The PDF Engine

The PDF generation has been engineered to sidestep common browser constraints. We don't render DOM nodes into images. Instead, a dedicated `pdfGenerator.ts` script translates your `InvoiceData` payload strictly into vector commands using `jsPDF`. 

**Why this matters:**
1. **No Bounding Box Artifacts**: Eradicates border-rendering failures common with `html2canvas`.
2. **Text Selectability**: Outputs selectable, pure text in the generated PDF for easy copying.
3. **Infinite Scaling**: Maximum crispness at any zoom level, perfect for professional printing.
4. **CSS Immunity**: Total invulnerability to modern CSS parsing bugs (`oklch()`, `color-mix`, etc.).

## 🌍 Internationalization (i18n)

Built from the ground up for a global audience, QuickInvoice supports dynamic locale switching without page reloads.

**Supported Locales:**
- 🇺🇸 English (Default)
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇦🇪 Arabic (with full right-to-left UI support)

The application automatically detects the user's browser language on first load and adapts both the UI translations and the currency formatting rules (e.g., `,` vs `.` decimal separators).

## 🚀 Development Setup

To get a local copy up and running, follow these simple steps.

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/quickinvoice.git
   ```
2. Navigate to the project directory
   ```bash
   cd quickinvoice
   ```
3. Install dependencies
   ```bash
   npm install
   ```
4. Start the development server
   ```bash
   npm run dev
   ```

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The output in `dist/` is an entirely portable Static Page Application (SPA). You can host this directory on any static provider (Netlify, Vercel, GitHub Pages, AWS S3).

## 🔒 Data Privacy & Security

QuickInvoice is a **zero-telemetry, zero-backend** application.

- **No Servers**: We do not maintain any databases.
- **No Cookies**: The application relies strictly on standard HTML5 `localStorage`.
- **No Analytics**: We do not inject Google Analytics, Mixpanel, or any tracking scripts.
- **Complete Ownership**: If you reset your browser data, your invoices are permanently deleted. There is no cloud recovery natively, which ensures maximum privacy for you and your clients.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
