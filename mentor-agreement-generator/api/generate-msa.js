'use strict';

const generateMSAHtml = require('../server/docgen/generateMSAHtml');

const REQUIRED = [
  'mentor_name', 'mentor_country_of_residence', 'mentor_address',
  'mentor_email', 'mentor_business_description', 'execution_date',
  'mentor_tax_id', 'mentor_entity_type',
  'fee_per_recorded_hour', 'fee_per_live_session', 'fee_per_content_creation_hour',
  'invoice_processing_days', 'company_signatory_name', 'company_signatory_designation',
];

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    const missing = REQUIRED.filter(f => !formData[f] || String(formData[f]).trim() === '');
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const html = generateMSAHtml(formData);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('MSA generation error:', err);
    res.status(500).json({ error: 'Failed to generate MSA: ' + err.message });
  }
};
