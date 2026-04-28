const express    = require('express');
const puppeteer  = require('puppeteer');
const router     = express.Router();
const generateMSAHtml = require('../docgen/generateMSAHtml');

router.post('/generate-msa', async (req, res) => {
  let browser;
  try {
    const formData = req.body;

    const required = [
      'mentor_name', 'mentor_country_of_residence', 'mentor_address',
      'mentor_email', 'mentor_business_description', 'execution_date',
      'mentor_tax_id', 'mentor_entity_type',
      'fee_per_recorded_hour', 'fee_per_live_session', 'fee_per_content_creation_hour',
      'invoice_processing_days', 'company_signatory_name', 'company_signatory_designation',
    ];

    const missing = required.filter(f => !formData[f] || String(formData[f]).trim() === '');
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const html = generateMSAHtml(formData);

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
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      timeout: 60000,
    });

    await browser.close();
    browser = null;

    const safeName = formData.mentor_name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
    const filename = `Mellone_MSA_${safeName}_${formData.execution_date}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error('MSA generation error:', err);
    res.status(500).json({ error: 'PDF generation failed: ' + err.message });
  }
});

module.exports = router;
