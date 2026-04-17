const express = require('express');
const puppeteer = require('puppeteer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const templatePath  = path.join(__dirname, 'templates', 'offer_letter.html');
const logoPath      = path.join(__dirname, 'public', 'assets', 'mellone_logo.png');
const signaturePath = path.join(__dirname, 'public', 'assets', 'founder_signature.png');

// ── Helpers ───────────────────────────────────────────────────────────────────

// DD/MM/YYYY from YYYY-MM-DD
function fmt(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// Indian number format: 1200000 → 12,00,000
function formatIndianNumber(raw) {
  const stripped = String(raw).replace(/[,\s]/g, '');
  const n = parseInt(stripped, 10);
  if (isNaN(n)) return raw; // pass through non-numeric input as-is
  const s = n.toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest  = s.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

function asDataUri(filePath, mime) {
  if (!fs.existsSync(filePath)) return '';
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function buildHtml(body) {
  const {
    candidateName,
    jobTitle,
    department,
    reportingManagerName,
    reportingManagerDesignation,
    dateOfJoining,
    totalCTC,
    offerDate,
    acceptanceDeadline,
  } = body;

  const reportingManager = reportingManagerDesignation
    ? `${reportingManagerName}, ${reportingManagerDesignation}`
    : reportingManagerName || '';

  const logoDataUri = asDataUri(logoPath, 'image/png');
  const sigDataUri  = asDataUri(signaturePath, 'image/png');

  // In the signature area: show image if available, otherwise a blank underline
  const signatureHtml = sigDataUri
    ? `<img src="${sigDataUri}" alt="Founder Signature" class="sig-image" />`
    : '<div class="sig-line-rule"></div>';

  const formattedCTC = formatIndianNumber(totalCTC || '');

  // Raw data embedded in preview HTML so the "Generate PDF" button can POST back
  const rawDataJson = JSON.stringify({
    candidateName:              candidateName || '',
    jobTitle:                   jobTitle || '',
    department:                 department || '',
    reportingManagerName:       reportingManagerName || '',
    reportingManagerDesignation: reportingManagerDesignation || '',
    dateOfJoining:              dateOfJoining || '',
    totalCTC:                   totalCTC || '',
    offerDate:                  offerDate || '',
    acceptanceDeadline:         acceptanceDeadline || '',
  });

  let html = fs.readFileSync(templatePath, 'utf8');

  return html
    .replace(/{{CANDIDATE_NAME}}/g,          candidateName || '')
    .replace(/{{JOB_TITLE}}/g,               jobTitle || '')
    .replace(/{{DEPARTMENT}}/g,              department || '')
    .replace(/{{REPORTING_MANAGER}}/g,       reportingManager)
    .replace(/{{DATE_OF_JOINING}}/g,         fmt(dateOfJoining))
    .replace(/{{TOTAL_CTC}}/g,               formattedCTC)
    .replace(/{{OFFER_DATE}}/g,              fmt(offerDate))
    .replace(/{{ACCEPTANCE_DEADLINE}}/g,     fmt(acceptanceDeadline))
    .replace(/{{FOUNDER_SIGNATURE_HTML}}/g,  signatureHtml)
    .replace(/{{MELLONE_LOGO_SRC}}/g,        logoDataUri)
    .replace('{{RAW_FORM_DATA_JSON}}',        rawDataJson);
}

function filenameDate(dateOfJoining) {
  if (!dateOfJoining) return '00000000';
  const [y, m, d] = dateOfJoining.split('-');
  return `${d}${m}${y}`;
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ ok: true }));

// Preview — returns rendered HTML (screen mode, for iframe srcdoc)
app.post('/preview', upload.none(), (req, res) => {
  try {
    const html = buildHtml(req.body);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ error: 'Preview failed: ' + err.message });
  }
});

// Generate PDF — Puppeteer in print mode for @media print styles
app.post('/generate-pdf', upload.none(), async (req, res) => {
  let browser;
  try {
    const html = buildHtml(req.body);

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.emulateMediaType('print');
    await page.setContent(html, { waitUntil: 'networkidle2', timeout: 60000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '20mm', left: '12mm' },
      timeout: 60000,
    });

    await browser.close();
    browser = null;

    const safeName = (req.body.candidateName || 'Candidate').replace(/\s+/g, '_');
    const filename = `Offer_Letter_${safeName}_${filenameDate(req.body.dateOfJoining)}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'PDF generation failed: ' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mellone Offer Letter Tool → http://localhost:${PORT}`);
});
