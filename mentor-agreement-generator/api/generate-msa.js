'use strict';

const generateMSAHtml = require('../server/docgen/generateMSAHtml');

const REQUIRED = [
  'mentor_name', 'mentor_country_of_residence', 'mentor_address',
  'mentor_email', 'mentor_business_description', 'execution_date',
  'mentor_tax_id', 'mentor_entity_type',
  'fee_per_recorded_hour', 'fee_per_live_session', 'fee_per_content_creation_hour',
  'invoice_processing_days', 'company_signatory_name', 'company_signatory_designation',
];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let browser;
  try {
    const formData = req.body;

    const missing = REQUIRED.filter(f => !formData[f] || String(formData[f]).trim() === '');
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const html = generateMSAHtml(formData);

    const chromium = require('@sparticuz/chromium');
    const puppeteer = require('puppeteer-core');

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.emulateMediaType('print');
    // domcontentloaded avoids hanging on external resources (e.g. Google Fonts) in serverless
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Brief wait so any synchronous JS/CSS in the document settles before printing
    await new Promise(r => setTimeout(r, 1000));

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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error('MSA generation error:', err);
    res.status(500).json({ error: 'PDF generation failed: ' + err.message });
  }
};
