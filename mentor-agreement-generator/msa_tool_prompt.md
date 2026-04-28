# MSA GENERATOR — CLAUDE CODE BUILD SPEC

## MISSION
Internal shared team tool. Collects mentor data via multi-step form → generates populated Mentor Services Agreement as .docx → triggers download. Deployed to public URL, no login, usable by all team members in browser.

---

## STACK
- React + Vite + Tailwind (frontend)
- Node.js + Express (backend — serves built React as static + API)
- `docx` npm package (document generation)
- Deploy target: Render or Railway (single service)
- Stateless — no DB

---

## FONT: Calibri
UI: `font-family: 'Calibri', 'Segoe UI', sans-serif`
.docx: all TextRun/Paragraph → `font: 'Calibri'`. Replace ALL `Arial` in generate_msa.js.

---

## BRAND
```
#1A1AE6 Deep Blue  → buttons, primary headings, CTAs
#3333CC Mid Blue   → section headings, dividers
#7B7BE8 Periwinkle → accents, step indicator active state
#F4F4FB Off White  → page background
#1C1C2E Dark Navy  → all body text, form labels
#4A4A6A Mid Gray   → helper text, captions
```

---

## FORM — 6 STEPS (validate before advancing)

### S1 — Residency Gate
Q: "Is the mentor a tax resident of India?" [Yes | No]
Gates: tax fields, jurisdiction clause, GST visibility, currency

### S2 — Personal Details
| Field | Type | Rule |
|---|---|---|
| mentor_name | text | min 2 words |
| mentor_country_of_residence | text | pre-fill "India" if S1=Yes |
| mentor_address | textarea | required |
| mentor_email | email | valid format |
| mentor_business_description | text | required |
| execution_date | date | default today; no past dates |

### S3 — Tax ID (branched on S1)

**IF S1=Yes (Indian):**
| Field | Type | Rule |
|---|---|---|
| mentor_tax_id_type | hidden | fixed = "PAN" |
| mentor_tax_id | text | `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/` |
| mentor_entity_type | dropdown | Individual / Registered Entity |
| mentor_entity_name | text | show if entity = Registered Entity |
| mentor_gstin | text | optional; if filled validate: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/` |
| fees_inclusive_exclusive_gst | radio | show only if gstin filled |

**IF S1=No (Non-Indian):**
| Field | Type | Rule |
|---|---|---|
| mentor_tax_id_type | dropdown | VAT Number / TFN / EIN / NI Number / Other |
| mentor_tax_id | text | required |
| mentor_entity_type | dropdown | Individual / Registered Entity |
| mentor_entity_name | text | show if entity = Registered Entity |

### S4 — Commercial Terms
| Field | Type | Rule |
|---|---|---|
| fee_currency | hidden→"INR" (Indian) / dropdown (Non-Indian) | USD/GBP/EUR/AED/SGD/AUD/Other |
| fee_currency_custom | text | show if fee_currency = Other |
| fee_per_recorded_hour | number | positive, 2dp |
| fee_per_live_session | number | positive, 2dp |
| fee_per_content_creation_hour | number | positive, 2dp |
| invoice_processing_days | number | default 30, positive int |

### S5 — Company Signatory (pre-filled, editable)
| Field | Default |
|---|---|
| company_signatory_name | [set default] |
| company_signatory_designation | [set default] |

### S6 — Review + Generate
- Summary table grouped by step
- Empty/unfilled fields flagged red
- Generate button disabled until all required fields confirmed
- On success: toast + auto-download .docx
- On error: specific field-level error message

---

## API

**POST /api/generate-msa**
Body: JSON formData
Response 200: .docx buffer
  `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  `Content-Disposition: attachment; filename="Mellone_MSA_[mentor_name]_[execution_date].docx"`
Response 400/500: `{ error: "description" }`

---

## DOCGEN — generateMSA(formData) → Promise\<Buffer\>

Refactor `generate_msa.js` (attached) into this exported function.

### Placeholders to replace
```
mentor_name                    mentor_address
mentor_email                   execution_date
mentor_country_of_residence    mentor_tax_id_type
mentor_tax_id                  mentor_entity_type
mentor_gstin                   fees_inclusive_exclusive_gst
fee_currency                   fee_per_recorded_hour
fee_per_live_session           fee_per_content_creation_hour
invoice_processing_days        company_signatory_name
company_signatory_designation  mentor_business_description
```

### Branch logic

**PARTIES:**
`"[name], a citizen of [country], having [tax_id_type] [tax_id], residing at [address]"`

**CLAUSE 3 — TAX:**
- Indian → TDS under Income Tax Act 1961; GST if registered
- Non-Indian → self-responsible for local taxes; Company withholds only where DTAA/Indian law mandates

**CLAUSE 9.9 — JURISDICTION:**
- Indian → Bangalore courts, exclusive jurisdiction
- Non-Indian → Bangalore courts, non-exclusive; option to elect UNCITRAL arbitration by mutual written agreement

**ANNEXURE 2 — TAX BLOCK:**
- Indian → PAN + GSTIN (if provided) + inclusive/exclusive choice + TDS note
- Non-Indian → tax_id_type + tax_id + self-responsibility clause

**FEE TABLE:**
- Currency label = fee_currency (or fee_currency_custom if Other)

### Hardcoded constants (do NOT expose as form fields)
```
agreement_term_years          = 1
renewal_notice_days           = 60 (Sixty)
termination_notice_days       = 30 (Thirty)
company_review_window_days    = 15 (Fifteen)
revision_completion_days      = 10 (Ten)
mentor_dispute_window_days    = 15 (Fifteen)
post_termination_invoice_days = 10 (Ten)
cohort_cancellation_notice    = 7 (Seven)
programme_intimation_notice   = 14 (Fourteen)
community_platforms           = WhatsApp/Discord
social_posts_per_cohort       = 2–3
```

---

## FILE STRUCTURE
```
/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css                  ← Calibri + brand CSS vars
│   │   └── components/
│   │       ├── StepIndicator.jsx
│   │       ├── FormField.jsx
│   │       └── steps/
│   │           ├── Step1Residency.jsx
│   │           ├── Step2PersonalDetails.jsx
│   │           ├── Step3TaxDetails.jsx
│   │           ├── Step4CommercialTerms.jsx
│   │           ├── Step5CompanySignatory.jsx
│   │           └── Step6Review.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── index.js                       ← Express: static + API
│   ├── routes/generate.js             ← POST /api/generate-msa
│   └── docgen/generateMSA.js          ← refactored from generate_msa.js
├── generate_msa.js                    ← source template (do not delete)
├── package.json                       ← root scripts
└── README.md
```

---

## ROOT SCRIPTS (package.json)
```json
{
  "scripts": {
    "dev": "concurrently \"node server/index.js\" \"vite client\"",
    "build": "vite build --root client",
    "start": "node server/index.js"
  }
}
```

---

## README MUST COVER
1. **Local dev:** `npm install` (root + client) → `npm run dev`
2. **Build:** `npm run build` → compiles React to `client/dist`
3. **Start:** `npm start` → Express serves `client/dist` as static + API
4. **Render deploy:** build cmd / start cmd / env vars list
5. **Railway deploy:** same + dashboard env var setup
6. **Team usage:** share public URL → open in browser → fill form → download MSA. No login. No install. Works for all team members immediately.

---

## STARTING POINT
`generate_msa.js` is attached. It contains:
- Full agreement text (Clauses 1–9.13 + Annexures 1–3)
- Mellone brand colours, header, footer
- All constants hardcoded
- Indian/Non-Indian branch text already written

**Your jobs:**
1. Refactor into `generateMSA(formData)` — swap placeholders, Arial→Calibri, apply branches conditionally
2. Wire to Express endpoint
3. Build React 6-step form UI
4. Ensure full stack deploys as a shared team tool at a public URL
