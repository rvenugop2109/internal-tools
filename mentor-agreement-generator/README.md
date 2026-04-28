# Mellone MSA Generator

Internal tool that generates a populated Mentor Services Agreement (`.docx`) via a browser-based 6-step form. No login required. Stateless.

---

## Local Development

```bash
# Install dependencies (run from repo root)
npm install

# Start the server
npm start
```

Open `http://localhost:3001` in your browser. No build step required.

---

## Build

```bash
npm run build
```

Compiles the React app to `client/dist/`.

---

## Production Start

```bash
NODE_ENV=production npm start
```

Express serves `client/dist/` as static files and handles `/api` routes. Open `http://localhost:3001`.

---

## Deploy to Render

| Setting | Value |
|---|---|
| **Build Command** | `npm install && cd client && npm install && cd .. && npm run build` |
| **Start Command** | `NODE_ENV=production npm start` |
| **Environment Variable** | `NODE_ENV=production` |

---

## Deploy to Railway

1. Connect the repository in the Railway dashboard.
2. Set these environment variables:
   - `NODE_ENV=production`
   - `PORT=3000` (Railway sets this automatically)
3. Build command: `npm install && cd client && npm install && cd .. && npm run build`
4. Start command: `NODE_ENV=production npm start`

---

## Team Usage

Share the public URL. Team members open it in any browser, fill the 6-step form, and click **Generate & Download MSA** — the `.docx` downloads immediately. No login, no install required.

---

## Form Steps

| Step | Fields |
|---|---|
| 1 Residency Gate | India resident? (Yes/No) — drives tax clauses, currency, jurisdiction |
| 2 Personal Details | Name, country, address, email, expertise, execution date |
| 3 Tax Details | PAN or foreign tax ID, entity type, GSTIN (optional, Indian only) |
| 4 Commercial Terms | Currency, fee rates (3 categories), invoice processing days |
| 5 Company Signatory | Signatory name and designation |
| 6 Review & Generate | Summary of all fields → generate and download |

---

## Document Structure

The generated `.docx` contains:

- **Clauses 1–9.13** — full legal text with Indian/Non-Indian branches
- **Annexure 1** — Description of Services  
- **Annexure 2** — Tax & Regulatory Details (branched by residency)
- **Annexure 3** — Fee Schedule table

Branding: Mellone Deep Blue headings, Calibri throughout, branded header and footer.
