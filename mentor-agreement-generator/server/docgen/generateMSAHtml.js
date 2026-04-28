'use strict';

const fs   = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../../public/assets/mellone_logo.png');
const SIG_PATH  = path.join(__dirname, '../../public/assets/founder_signature.png');

const RENEWAL_NOTICE       = { days: 60,  words: 'Sixty' };
const TERMINATION_NOTICE   = { days: 30,  words: 'Thirty' };
const REVIEW_WINDOW        = { days: 15,  words: 'Fifteen' };
const REVISION_DAYS        = { days: 10,  words: 'Ten' };
const DISPUTE_WINDOW       = { days: 15,  words: 'Fifteen' };
const POST_TERM_INVOICE    = { days: 10,  words: 'Ten' };
const COHORT_CANCEL_NOTICE = { days: 7,   words: 'Seven' };
const PROGRAMME_INTIMATION = { days: 14,  words: 'Fourteen' };
const COMMUNITY_PLATFORMS  = 'WhatsApp/Discord';
const SOCIAL_POSTS_PER_COHORT = '2–3';

const CO_NAME    = 'Newlogix Technologies Pvt Ltd';
const CO_CIN     = 'U62099KA2025PTC207430';
const CO_ADDR1   = 'T7 Viola 1103, Salarpuria Sattva Cadenza,';
const CO_ADDR2   = 'Kudlu Jn. Bommanahalli, Bangalore – 560068, Karnataka.';
const CO_WEB     = 'www.mellone.ai &nbsp;│&nbsp; +91 81294 28742 &nbsp;│&nbsp; hi@mellone.ai';
const CO_CITY    = 'Bangalore';

function asDataUri(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function e(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function sh(text) {
  return `<p class="section-heading">${e(text)}</p>`;
}

function sub(num, content) {
  return `<div class="sub"><span class="sub-n">${e(num)}</span><span class="sub-t">${content}</span></div>`;
}

function fmtFee(val) {
  const v = (val || '').toString().trim();
  if (!v || v.toUpperCase() === 'N/A') return 'N/A';
  const n = Number(v);
  return isNaN(n) ? 'N/A' : n.toFixed(2);
}

function dataTable(headers, rows) {
  const ths = headers.map(h => `<th>${e(h)}</th>`).join('');
  const trs = rows.map((r, i) =>
    `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">${r.map(c => `<td>${e(c)}</td>`).join('')}</tr>`
  ).join('');
  return `<table class="data-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}

function lh(logoUri) {
  return `
    <div class="lh">
      <div class="lh-left">
        <div class="company-name">${CO_NAME}</div>
        <div class="company-meta">
          CIN: ${CO_CIN}<br/>
          ${CO_ADDR1}<br/>
          ${CO_ADDR2}<br/>
          ${CO_WEB}
        </div>
      </div>
      ${logoUri ? `<div class="lh-right"><img class="logo" src="${logoUri}" alt="Mellone"/></div>` : ''}
    </div>`;
}

function generateMSAHtml(fd) {
  const isIndian   = fd.is_india_resident === 'yes';
  const currency   = fd.fee_currency === 'Other' ? (fd.fee_currency_custom || 'Other') : (fd.fee_currency || 'INR');
  const entityLabel = fd.mentor_entity_type === 'Registered Entity' && fd.mentor_entity_name
    ? `${fd.mentor_entity_name} (${fd.mentor_entity_type})`
    : fd.mentor_entity_type || 'Individual';
  const invoiceDays = fd.invoice_processing_days || 30;
  const execDate   = fmtDate(fd.execution_date);
  const taxIdType  = isIndian ? 'PAN' : (fd.mentor_tax_id_type || 'Tax ID');
  const logoUri    = asDataUri(LOGO_PATH);
  const sigUri     = asDataUri(SIG_PATH);

  const clause3Tax = isIndian ? `
    ${sub('3.5', `<strong>Tax Deducted at Source (TDS):</strong> The Company shall deduct tax at source (TDS) from all payments made to the Mentor at the applicable rate under the Income Tax Act, 1961, and shall issue Form 16A and other TDS certificates as required by law. The Mentor shall be solely responsible for filing their income tax returns.`)}
    ${fd.mentor_gstin
      ? sub('3.6', `<strong>Goods and Services Tax (GST):</strong> The Mentor is registered under the Goods and Services Tax Act. GST shall be treated as ${e(fd.fees_inclusive_exclusive_gst || 'exclusive')} of the Fees as specified in Annexure 2. The Mentor shall be solely responsible for GST compliance, filing returns, and remitting GST to the relevant government authorities.`)
      : sub('3.6', `<strong>Goods and Services Tax (GST):</strong> The Mentor has not provided a GSTIN. GST obligations, if any arise in future, shall be dealt with by way of written amendment to this Agreement.`)}
  ` : `
    ${sub('3.5', `<strong>Tax Responsibilities:</strong> The Mentor shall be solely responsible for all taxes, levies, duties, and contributions imposed by any government authority in the Mentor's country of residence or any other jurisdiction, arising from or in connection with fees received under this Agreement. The Mentor shall indemnify the Company against any claim, demand, or liability arising from the Mentor's failure to comply with their tax obligations.`)}
    ${sub('3.6', `<strong>Withholding:</strong> The Company shall withhold taxes from payments to the Mentor only where required by the Indian Income Tax Act, 1961 or the applicable Double Taxation Avoidance Agreement (DTAA) between India and ${e(fd.mentor_country_of_residence)}. The Company shall provide the Mentor with appropriate certificates for any amounts so withheld.`)}
  `;

  const clause99 = isIndian
    ? sub('9.9', `<strong>Governing Law and Jurisdiction:</strong> This Agreement shall be governed by and construed in accordance with the laws of India. The Parties irrevocably submit to the exclusive jurisdiction of the courts in ${CO_CITY}, Karnataka, India for the resolution of any disputes arising out of or in connection with this Agreement.`)
    : sub('9.9', `<strong>Governing Law and Jurisdiction:</strong> This Agreement shall be governed by and construed in accordance with the laws of India. The Parties submit to the non-exclusive jurisdiction of the courts in ${CO_CITY}, Karnataka, India. By mutual written agreement, the Parties may elect to resolve any dispute through arbitration under the UNCITRAL Arbitration Rules, with the seat of arbitration in ${CO_CITY}, India and proceedings conducted in the English language.`);

  const annexure2Body = isIndian ? `
    <p class="body"><strong>Mentor Tax Identification (India)</strong></p>
    ${dataTable(
      ['Detail', 'Value'],
      [
        ['Full Name',     fd.mentor_name],
        ['Entity Type',   entityLabel],
        ['PAN',           fd.mentor_tax_id],
        ['GSTIN',         fd.mentor_gstin || 'Not provided'],
        ['GST Treatment', fd.mentor_gstin ? `Fees are ${fd.fees_inclusive_exclusive_gst || 'exclusive'} of GST` : 'N/A'],
      ]
    )}
    ${sh('TDS (Tax Deducted at Source)')}
    <p class="body">The Company shall deduct TDS from all payments to the Mentor at the applicable rate under the Income Tax Act, 1961 and issue Form 16A (or other applicable TDS certificate) for each financial year.</p>
    ${fd.mentor_gstin ? `
      ${sh('GST Compliance')}
      <p class="body">The Mentor holds GSTIN ${e(fd.mentor_gstin)}. GST is ${e(fd.fees_inclusive_exclusive_gst || 'exclusive')} of the fees in Annexure 3. The Mentor is solely responsible for GST filings and remittances.</p>
    ` : ''}
  ` : `
    <p class="body"><strong>Mentor Tax Identification (${e(fd.mentor_country_of_residence)})</strong></p>
    ${dataTable(
      ['Detail', 'Value'],
      [
        ['Full Name',            fd.mentor_name],
        ['Entity Type',          entityLabel],
        ['Tax ID Type',          fd.mentor_tax_id_type || 'Tax ID'],
        ['Tax ID',               fd.mentor_tax_id],
        ['Country of Residence', fd.mentor_country_of_residence],
      ]
    )}
    ${sh('Tax Responsibility')}
    <p class="body">The Mentor shall be solely responsible for all taxes, levies, duties, and contributions imposed in ${e(fd.mentor_country_of_residence)} or any other jurisdiction arising from fees received under this Agreement. The Company shall withhold taxes only where mandated by the Income Tax Act, 1961 or the applicable DTAA between India and ${e(fd.mentor_country_of_residence)}.</p>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --deep-blue: #1A1AE6;
    --mid-blue:  #3333CC;
    --dark-navy: #1C1C2E;
    --mid-gray:  #4A4A6A;
  }

  body {
    font-family: 'Sora', Arial, sans-serif;
    font-size: 9pt;
    color: var(--dark-navy);
    background: #fff;
    line-height: 1.6;
  }

  /* ── Print toolbar (screen only) ── */
  #print-bar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
    background: #1A1AE6; color: #fff;
    padding: 10px 24px;
    display: flex; align-items: center; justify-content: space-between;
    font-family: 'Sora', Arial, sans-serif; font-size: 13px;
    box-shadow: 0 2px 8px rgba(0,0,0,.25);
  }
  #print-bar button {
    background: #fff; color: #1A1AE6; border: none; border-radius: 6px;
    padding: 7px 20px; font-weight: 700; cursor: pointer; font-size: 13px;
    font-family: 'Sora', Arial, sans-serif;
  }
  #print-bar button:hover { background: #f0f0ff; }
  #print-spacer { height: 44px; }

  /* ── Print: hide toolbar, suppress browser headers/footers ── */
  @media print {
    #print-bar, #print-spacer { display: none !important; }
    @page { margin: 0; size: A4 portrait; }
  }

  /* ── Page ── */
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 10mm 12mm 0;
    page-break-after: always;
    display: flex;
    flex-direction: column;
  }
  .page:last-child { page-break-after: auto; }
  .page-content { flex: 1; }

  /* ── Letterhead ── */
  .lh { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8pt; }
  .company-name { font-size: 10pt; font-weight: 700; color: var(--deep-blue); margin-bottom: 2pt; }
  .company-meta { font-size: 7.5pt; color: var(--mid-gray); line-height: 1.55; }
  .logo { height: 64px; width: auto; }

  /* ── Document title ── */
  .doc-title {
    font-size: 15pt; font-weight: 700; color: var(--deep-blue);
    margin-bottom: 4pt;
  }
  .doc-date {
    font-size: 9pt; font-style: italic; color: var(--mid-gray);
    margin-top: 8pt; margin-bottom: 8pt;
  }

  /* ── Section headings ── */
  .section-heading {
    font-size: 9pt; font-weight: 700; color: var(--deep-blue);
    text-transform: uppercase; letter-spacing: 0.4px;
    border-bottom: 1.5px solid var(--mid-blue);
    padding-bottom: 3pt; margin-top: 11pt; margin-bottom: 6pt;
  }

  /* ── Annexure title ── */
  .annex-title {
    font-size: 13pt; font-weight: 700; color: var(--deep-blue);
    text-transform: uppercase; text-align: center;
    letter-spacing: 0.05em; margin-bottom: 2pt;
  }
  .annex-subtitle {
    font-size: 10pt; font-weight: 700; color: var(--mid-blue);
    text-align: center; margin-bottom: 8pt;
  }

  /* ── Body paragraphs ── */
  p.body {
    font-size: 9pt; line-height: 1.6;
    text-align: justify; margin-bottom: 5pt;
  }

  /* ── Sub-clauses ── */
  .sub { display: flex; gap: 7pt; margin-bottom: 5pt; page-break-inside: avoid; }
  .sub-n { font-weight: 700; color: var(--dark-navy); flex-shrink: 0; width: 26pt; font-size: 9pt; line-height: 1.6; }
  .sub-t { flex: 1; font-size: 9pt; line-height: 1.6; text-align: justify; min-width: 0; }

  /* ── Data table ── */
  .data-table { width: 100%; border-collapse: collapse; margin: 6pt 0 8pt; font-size: 8.5pt; }
  .data-table th { background: var(--deep-blue); color: #fff; padding: 4pt 8pt; text-align: left; font-weight: 700; }
  .data-table td { padding: 3.5pt 8pt; vertical-align: top; border: 1px solid #E0E0F0; }
  .data-table thead tr th { border: 1px solid #1212c0; }
  .data-table .even td { background: #F4F4FB; }
  .data-table .odd  td { background: #fff; }

  /* ── Signature block ── */
  .sig-heading { font-size: 15pt; font-weight: 700; color: var(--deep-blue); margin-bottom: 5pt; }
  .sig-intro   { font-size: 9pt; color: var(--dark-navy); margin-bottom: 18pt; }
  .sig-columns { display: flex; gap: 40pt; margin-top: 16pt; }
  .sig-col { flex: 1; }
  .sig-col-label    { font-size: 9pt; font-weight: 700; color: var(--deep-blue); margin-bottom: 2pt; }
  .sig-col-sublabel { font-size: 9pt; color: var(--mid-gray); margin-bottom: 20pt; }

  /* Company signature area — centered image above left-aligned text */
  .co-sig-area { position: relative; height: 112pt; margin-bottom: 6pt; }
  .co-sig-img  { display: block; position: absolute; bottom: 4pt; left: 50%; transform: translateX(-50%); height: 100pt; width: auto; }
  .co-sig-line { position: absolute; bottom: 0; left: 0; right: 0; border-bottom: 1px solid var(--dark-navy); }
  .co-sig-name { font-size: 10pt; font-weight: 700; color: var(--dark-navy); margin-bottom: 2pt; }
  .co-sig-role { font-size: 9pt; color: var(--mid-gray); margin-bottom: 10pt; }
  .co-sig-date { font-size: 9pt; font-weight: 700; color: var(--dark-navy); }

  /* Mentor signature area — same height as company block so text rows align */
  .sig-area { height: 112pt; position: relative; margin-bottom: 6pt; }
  .sig-line-rule { position: absolute; bottom: 0; left: 0; right: 0; border-bottom: 1px solid var(--dark-navy); }
  .sig-name { font-size: 10pt; font-weight: 700; color: var(--dark-navy); margin-bottom: 2pt; }
  .sig-role { font-size: 9pt; color: var(--mid-gray); margin-bottom: 10pt; }
  .sig-date { font-size: 9pt; font-weight: 700; color: var(--dark-navy); }
  .sig-date-line { display: inline-block; width: 120pt; border-bottom: 1px solid var(--dark-navy); margin-left: 4pt; vertical-align: bottom; }

  /* ── Note text ── */
  .note { font-size: 8pt; font-style: italic; color: var(--mid-gray); margin-top: 6pt; }

  /* ── Confidentiality footer (screen only, inside each page) ── */
  .conf-footer {
    font-size: 7pt; color: var(--mid-gray); text-align: center;
    font-style: italic; line-height: 1.5;
    border-top: 1px solid #D0D0E8; padding-top: 4pt;
  }

  /* ── Screen mode ── */
  @media screen {
    body { background: #D8D8D8; padding: 28px 0 48px; }
    .page { background: #fff; margin: 0 auto 28px; box-shadow: 0 3px 24px rgba(0,0,0,0.18); }
    .page-content { flex: 1; }
    .conf-footer { margin-top: auto; padding: 4pt 0 8mm; }
    .conf-footer-fixed { display: none; }
  }

  /* ── Print mode (Puppeteer PDF) ── */
  @media print {
    body { background: #fff; padding: 0; }
    .page { padding-bottom: 14mm; }
    .page-break { page-break-before: always; }
    .conf-footer { display: none; }
    .conf-footer-fixed {
      display: block;
      position: fixed;
      bottom: 0; left: 0; right: 0;
      border-top: 1px solid #D0D0E8;
      padding: 4pt 12mm 3pt;
      font-size: 7pt; color: var(--mid-gray);
      text-align: center; font-style: italic;
      background: #fff;
    }
  }
</style>
</head>
<body>

<div id="print-bar">
  <span>Mellone — Mentor Services Agreement &nbsp;·&nbsp; ${e(fd.mentor_name)} &nbsp;·&nbsp; ${execDate}</span>
  <button onclick="window.print()">⬇&nbsp; Save as PDF</button>
</div>
<div id="print-spacer"></div>

<!-- Fixed footer for PDF (visible in print only) -->
<div class="conf-footer-fixed">
  This agreement is private and confidential. &nbsp;│&nbsp; CIN: ${CO_CIN}
</div>


<!-- ══════════════════ PAGE 1 — Parties, Recitals, Clause 1 ══════════════════ -->
<div class="page">
<div class="page-content">

  ${lh(logoUri)}

  <p class="doc-date">Date: ${execDate}</p>
  <p class="doc-title">Mentor Services Agreement</p>

  ${sh('Parties')}
  <p class="body"><strong>1. ${CO_NAME}</strong>, a company incorporated under the Companies Act, 2013, having its registered office at ${CO_ADDR1} ${CO_ADDR2} (hereinafter referred to as <strong>"Company"</strong>);</p>
  <p class="body"><strong>2. ${e(fd.mentor_name)}</strong>, a citizen of ${e(fd.mentor_country_of_residence)}, having ${e(taxIdType)} ${e(fd.mentor_tax_id)}, residing at ${e(fd.mentor_address)} (hereinafter referred to as <strong>"Mentor"</strong>).</p>
  <p class="body">(The Company and the Mentor are hereinafter individually referred to as a <strong>"Party"</strong> and collectively as the <strong>"Parties"</strong>.)</p>

  ${sh('Recitals')}
  ${sub('A.', 'The Company is engaged in the business of providing AI training, consulting, and education services to professionals and organisations.')}
  ${sub('B.', `The Mentor possesses expertise and experience in ${e(fd.mentor_business_description)} and is desirous of providing mentoring, training, and content creation services to the Company.`)}
  ${sub('C.', 'The Company desires to engage the Mentor as an independent contractor to provide certain services, and the Mentor desires to provide such services, on the terms and conditions set out in this Agreement.')}
  <p class="body"><strong>NOW, THEREFORE</strong>, in consideration of the mutual promises and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:</p>

  ${sh('Clause 1: Definitions')}
  <p class="body">In this Agreement, unless the context otherwise requires:</p>
  ${sub('1.1', '<strong>"Agreement"</strong> means this Mentor Services Agreement together with all Annexures attached hereto.')}
  ${sub('1.2', '<strong>"Cohort"</strong> means a batch of learners enrolled for a specific programme or course offered by the Company.')}
  ${sub('1.3', '<strong>"Company Materials"</strong> means any proprietary materials, curriculum, course frameworks, platform access, brand guidelines, or other intellectual property provided by the Company to the Mentor.')}
  ${sub('1.4', '<strong>"Confidential Information"</strong> means any non-public information disclosed by one Party to the other, including but not limited to business plans, pricing, learner data, curriculum content, technology, and operational information.')}
  ${sub('1.5', '<strong>"Deliverables"</strong> means any content, materials, recordings, documents, or other outputs created by the Mentor in connection with the Services.')}
  ${sub('1.6', `<strong>"Effective Date"</strong> means ${execDate}.`)}
  ${sub('1.7', '<strong>"Services"</strong> means the mentoring, training, content creation, and related services described in Annexure 1.')}
  ${sub('1.8', '<strong>"Term"</strong> means the duration of this Agreement as set out in Clause 7.1.')}

</div>
<div class="conf-footer">This agreement is private and confidential. &nbsp;│&nbsp; CIN: ${CO_CIN}</div>
</div>


<!-- ══════════════════ PAGE 2 — Clauses 2 & 3 ═══════════════════════════════ -->
<div class="page">
<div class="page-content">

  ${lh(logoUri)}

  ${sh('Clause 2: Appointment and Scope of Services')}
  ${sub('2.1', 'The Company hereby engages the Mentor as an independent contractor, and the Mentor accepts such engagement, to provide the Services as described in Annexure 1.')}
  ${sub('2.2', '<strong>Recorded Content:</strong> The Mentor shall create high-quality recorded instructional content as directed by the Company. All recordings shall meet the technical and content specifications communicated by the Company from time to time.')}
  ${sub('2.3', `<strong>Live Sessions:</strong> The Mentor shall conduct live training sessions, workshops, and Q&amp;A sessions for Cohorts as scheduled by mutual agreement. In the event the Company cancels a scheduled live session, the Company shall provide the Mentor with at least ${COHORT_CANCEL_NOTICE.words} (${COHORT_CANCEL_NOTICE.days}) days' prior written notice.`)}
  ${sub('2.4', `<strong>Content Review and Revision:</strong> The Mentor shall review content developed by the Company upon request. The Company shall have ${REVIEW_WINDOW.words} (${REVIEW_WINDOW.days}) days to review Deliverables submitted by the Mentor and provide feedback. The Mentor shall complete all revisions within ${REVISION_DAYS.words} (${REVISION_DAYS.days}) days of receiving feedback.`)}
  ${sub('2.5', `<strong>Community Engagement:</strong> The Mentor shall actively engage with learners and Cohort participants on community platforms (${COMMUNITY_PLATFORMS}) as designated by the Company.`)}
  ${sub('2.6', `<strong>Programme Promotion:</strong> The Mentor shall support the promotion of the Company's programmes by making ${SOCIAL_POSTS_PER_COHORT} social media posts per Cohort, in a format and with content approved by the Company.`)}
  ${sub('2.7', `<strong>Programme Intimation:</strong> The Company shall inform the Mentor of upcoming programme schedules at least ${PROGRAMME_INTIMATION.words} (${PROGRAMME_INTIMATION.days}) days in advance of the first session.`)}
  ${sub('2.8', "The Mentor shall perform all Services with due skill, care, and diligence, in accordance with applicable professional standards and the Company's reasonable instructions.")}

  ${sh('Clause 3: Fees, Invoicing, and Taxes')}
  ${sub('3.1', '<strong>Fees:</strong> In consideration of the Services, the Company shall pay the Mentor the fees as set out in Annexure 3.')}
  ${sub('3.2', '<strong>Invoicing:</strong> The Mentor shall submit invoices to the Company in accordance with the fee structure set out in Annexure 3. Invoices shall be submitted at the completion of each engagement or as otherwise mutually agreed in writing.')}
  ${sub('3.3', `<strong>Payment:</strong> The Company shall process and remit payment within ${invoiceDays} days from the date of receipt of a valid, undisputed invoice.`)}
  ${sub('3.4', `<strong>Disputed Invoices:</strong> In the event of any invoice dispute, the Company shall notify the Mentor within ${DISPUTE_WINDOW.words} (${DISPUTE_WINDOW.days}) days of receipt of the invoice, specifying the grounds for dispute. The Parties shall endeavour to resolve the dispute in good faith within ${DISPUTE_WINDOW.words} (${DISPUTE_WINDOW.days}) days of such notification.`)}
  ${clause3Tax}

</div>
<div class="conf-footer">This agreement is private and confidential. &nbsp;│&nbsp; CIN: ${CO_CIN}</div>
</div>


<!-- ══════════════════ PAGE 3 — Clauses 4, 5 & 6 ════════════════════════════ -->
<div class="page">
<div class="page-content">

  ${lh(logoUri)}

  ${sh('Clause 4: Intellectual Property Rights')}
  ${sub('4.1', '<strong>Assignment of Deliverables:</strong> All Deliverables created by the Mentor in connection with the Services shall be the exclusive property of the Company from the moment of creation. The Mentor hereby irrevocably assigns to the Company all right, title, and interest in and to the Deliverables, including all copyright, neighbouring rights, and any other intellectual property rights therein.')}
  ${sub('4.2', '<strong>Moral Rights:</strong> The Mentor hereby waives all moral rights in respect of the Deliverables to the fullest extent permitted by applicable law.')}
  ${sub('4.3', '<strong>Pre-Existing IP:</strong> The Mentor retains ownership of any intellectual property owned by the Mentor prior to the Effective Date ("Pre-Existing IP"). To the extent that any Pre-Existing IP is incorporated into the Deliverables, the Mentor grants the Company a non-exclusive, irrevocable, royalty-free, worldwide licence to use, reproduce, and modify such Pre-Existing IP solely as part of the Deliverables.')}
  ${sub('4.4', '<strong>Company Materials:</strong> The Mentor acknowledges that all Company Materials remain the exclusive property of the Company. The Mentor shall not use Company Materials for any purpose other than the performance of the Services.')}
  ${sub('4.5', "The Mentor grants the Company the right to use the Mentor's name, biographical information, photograph, and likeness in connection with the promotion of the Company's programmes and services during the Term.")}

  ${sh('Clause 5: Confidentiality')}
  ${sub('5.1', '<strong>Obligation:</strong> Each Party ("Receiving Party") shall keep confidential all Confidential Information disclosed by the other Party ("Disclosing Party") and shall not disclose such information to any third party without the prior written consent of the Disclosing Party.')}
  ${sub('5.2', '<strong>Use Restriction:</strong> Each Party shall use Confidential Information solely for the purposes of this Agreement and shall not exploit it for any other purpose.')}
  ${sub('5.3', "Each Party shall protect the Confidential Information of the other Party with at least the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care.")}
  ${sub('5.4', '<strong>Exceptions:</strong> The obligations in this Clause shall not apply to information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was rightfully known to the Receiving Party before disclosure; (c) is independently developed by the Receiving Party without reference to the Confidential Information; or (d) is required to be disclosed by applicable law, provided the Receiving Party gives prompt prior written notice to the Disclosing Party.')}
  ${sub('5.5', '<strong>Survival:</strong> The obligations in this Clause shall survive the termination or expiry of this Agreement for a period of three (3) years.')}

  ${sh('Clause 6: Non-Solicitation')}
  ${sub('6.1', '<strong>Non-Solicitation of Learners and Clients:</strong> During the Term and for a period of twelve (12) months following the termination or expiry of this Agreement, the Mentor shall not, directly or indirectly, solicit, approach, or accept business from any learner, client, or prospective client of the Company with whom the Mentor came into contact through the performance of the Services.')}
  ${sub('6.2', '<strong>Non-Solicitation of Personnel:</strong> During the Term and for a period of twelve (12) months following termination or expiry, the Mentor shall not directly or indirectly solicit, hire, or engage any employee, contractor, or agent of the Company.')}

</div>
<div class="conf-footer">This agreement is private and confidential. &nbsp;│&nbsp; CIN: ${CO_CIN}</div>
</div>


<!-- ══════════════════ PAGE 4 — Clauses 7 & 8 ═══════════════════════════════ -->
<div class="page">
<div class="page-content">

  ${lh(logoUri)}

  ${sh('Clause 7: Term and Termination')}
  ${sub('7.1', '<strong>Term:</strong> This Agreement shall commence on the Effective Date and shall continue for a period of one (1) year, unless earlier terminated in accordance with this Clause.')}
  ${sub('7.2', `<strong>Renewal:</strong> This Agreement shall automatically renew for successive one (1) year periods unless either Party provides written notice of non-renewal to the other Party at least ${RENEWAL_NOTICE.words} (${RENEWAL_NOTICE.days}) days prior to the expiry of the then-current term.`)}
  ${sub('7.3', `<strong>Termination for Convenience:</strong> Either Party may terminate this Agreement for any reason by providing ${TERMINATION_NOTICE.words} (${TERMINATION_NOTICE.days}) days' prior written notice to the other Party.`)}
  ${sub('7.4', '<strong>Termination for Cause:</strong> Either Party may terminate this Agreement immediately upon written notice if the other Party: (a) materially breaches this Agreement and fails to cure such breach within fourteen (14) days of receiving written notice thereof; (b) becomes insolvent, bankrupt, or makes an assignment for the benefit of creditors; or (c) engages in fraud, wilful misconduct, or criminal activity.')}
  ${sub('7.5', `<strong>Post-Termination Invoicing:</strong> Upon termination or expiry of this Agreement, the Mentor shall submit all outstanding invoices for Services rendered prior to the date of termination within ${POST_TERM_INVOICE.words} (${POST_TERM_INVOICE.days}) days of the termination date. The Company shall not be obligated to pay any invoice submitted after this period.`)}
  ${sub('7.6', "Upon termination or expiry: (a) each Party shall promptly return or destroy all Confidential Information of the other Party; (b) the Mentor shall immediately cease use of all Company Materials; (c) clauses that by their nature survive termination (including Clauses 4, 5, 6, 8, and 9) shall continue in effect.")}

  ${sh('Clause 8: Representations and Warranties')}
  ${sub('8.1', `<strong>Company Representations:</strong> The Company represents and warrants that: (a) it has full power and authority to enter into this Agreement; (b) execution and performance of this Agreement does not violate any agreement to which the Company is a party; and (c) it shall make payments to the Mentor in a timely manner in accordance with this Agreement.`)}
  ${sub('8.2', "<strong>Mentor Representations:</strong> The Mentor represents and warrants that: (a) the Mentor has full power and authority to enter into this Agreement; (b) execution and performance of this Agreement does not violate any agreement to which the Mentor is a party; (c) the Mentor possesses the skills, qualifications, and experience necessary to perform the Services; (d) the Deliverables will be original works and will not infringe any third-party intellectual property rights; and (e) the Mentor will comply with all applicable laws and regulations in the performance of the Services.")}

</div>
<div class="conf-footer">This agreement is private and confidential. &nbsp;│&nbsp; CIN: ${CO_CIN}</div>
</div>


<!-- ══════════════════ PAGE 5 — Clause 9 ════════════════════════════════════ -->
<div class="page">
<div class="page-content">

  ${lh(logoUri)}

  ${sh('Clause 9: General Provisions')}
  ${sub('9.1', '<strong>Independent Contractor:</strong> The Mentor is an independent contractor. Nothing in this Agreement shall be construed to create an employer-employee relationship, partnership, joint venture, or agency between the Parties. The Mentor shall be solely responsible for all taxes, social security contributions, insurance, and other obligations arising from the independent contractor relationship.')}
  ${sub('9.2', 'This Agreement, together with its Annexures, constitutes the entire agreement between the Parties with respect to its subject matter and supersedes all prior agreements, representations, and understandings.')}
  ${sub('9.3', '<strong>Amendments:</strong> No amendment or modification of this Agreement shall be valid unless made in writing and signed by authorised representatives of both Parties.')}
  ${sub('9.4', "The failure of either Party to enforce any provision of this Agreement shall not be construed as a waiver of that Party's right to enforce such provision in the future.")}
  ${sub('9.5', '<strong>Severability:</strong> If any provision of this Agreement is held to be invalid or unenforceable, such provision shall be modified to the minimum extent necessary to make it valid and enforceable, and the remaining provisions shall continue in full force and effect.')}
  ${sub('9.6', '<strong>Notices:</strong> All notices under this Agreement shall be in writing and delivered by email (with acknowledgement of receipt) or courier to the addresses specified in this Agreement or such other addresses as may be notified by a Party in writing from time to time.')}
  ${sub('9.7', '<strong>Force Majeure:</strong> Neither Party shall be liable for any delay or failure in performance resulting from causes beyond its reasonable control, including acts of God, government actions, pandemics, or natural disasters, provided the affected Party gives prompt written notice to the other Party and uses reasonable endeavours to mitigate the impact.')}
  ${sub('9.8', "The Mentor may not assign or transfer any rights or obligations under this Agreement without the prior written consent of the Company. The Company may assign this Agreement to any affiliate or successor entity without the Mentor's consent, provided the Company notifies the Mentor in writing.")}
  ${clause99}
  ${sub('9.10', '<strong>Counterparts:</strong> This Agreement may be executed in counterparts, each of which shall constitute an original, and all of which together shall constitute one and the same instrument. Electronic signatures shall be deemed valid and binding.')}
  ${sub('9.11', '<strong>Language:</strong> This Agreement is written in English and all communications, notices, and documents under this Agreement shall be in English.')}
  ${sub('9.12', '<strong>Relationship of Parties:</strong> Nothing in this Agreement shall be construed to create any agency, employment, partnership, or joint venture relationship between the Parties. The Mentor shall not represent itself as an agent or employee of the Company.')}
  ${sub('9.13', '<strong>Headings:</strong> The headings in this Agreement are for convenience of reference only and shall not affect the construction or interpretation of this Agreement.')}

</div>
<div class="conf-footer">This agreement is private and confidential. &nbsp;│&nbsp; CIN: ${CO_CIN}</div>
</div>


<!-- ══════════════════ PAGE 6 — Signature Page ══════════════════════════════ -->
<div class="page">
<div class="page-content">

  ${lh(logoUri)}

  <p class="sig-heading">Signatures</p>
  <div class="section-heading" style="margin-top:0"></div>
  <p class="sig-intro">IN WITNESS WHEREOF, the Parties have executed this Mentor Services Agreement as of the date first written above.</p>

  <div class="sig-columns">
    <div class="sig-col">
      <p class="sig-col-label">For ${CO_NAME}</p>
      <p class="sig-col-sublabel">(Mellone)</p>
      <div class="co-sig-area">
        ${sigUri ? `<img class="co-sig-img" src="${sigUri}" alt="Signature"/>` : ''}
        <div class="co-sig-line"></div>
      </div>
      <p class="co-sig-name">${e(fd.company_signatory_name)}</p>
      <p class="co-sig-role">${e(fd.company_signatory_designation)}</p>
      <p class="co-sig-date">Date: ${execDate}</p>
    </div>
    <div class="sig-col">
      <p class="sig-col-label">Accepted by</p>
      <p class="sig-col-sublabel">(Mentor)</p>
      <div class="sig-area"><div class="sig-line-rule"></div></div>
      <p class="sig-name">${e(fd.mentor_name)}</p>
      <p class="sig-role">${e(fd.mentor_email)}</p>
      <p class="sig-date">Date: <span class="sig-date-line"></span></p>
    </div>
  </div>

</div>
<div class="conf-footer">This agreement is private and confidential. &nbsp;│&nbsp; CIN: ${CO_CIN}</div>
</div>


<!-- ══════════════════ PAGE 7 — Annexure 1 ══════════════════════════════════ -->
<div class="page">
<div class="page-content">

  ${lh(logoUri)}

  <p class="annex-title">Annexure 1</p>
  <p class="annex-subtitle">Description of Services</p>
  <div class="section-heading" style="margin-top:0"></div>

  <p class="body">The Mentor shall provide the following categories of services under this Agreement:</p>
  ${sub('1.', '<strong>Recorded Content Creation:</strong> Create video lessons, tutorials, and instructional content as directed by the Company. All recordings must meet the technical and content specifications communicated by the Company.')}
  ${sub('2.', '<strong>Live Sessions:</strong> Conduct live training sessions, workshops, demonstrations, and interactive Q&amp;A sessions for Cohorts.')}
  ${sub('3.', '<strong>Content Review and Quality Assurance:</strong> Review and provide structured feedback on curriculum content, course materials, and other educational content developed by or for the Company.')}
  ${sub('4.', `<strong>Community Engagement:</strong> Actively participate in and moderate learner community channels (${COMMUNITY_PLATFORMS}), respond to learner queries, and foster constructive engagement.`)}
  ${sub('5.', `<strong>Programme Promotion:</strong> Create and publish ${SOCIAL_POSTS_PER_COHORT} social media posts per Cohort to promote the Company's programmes, using approved messaging and brand guidelines.`)}
  ${sub('6.', '<strong>Ad Hoc Consulting:</strong> Provide consulting and advisory input on curriculum design, pedagogical approaches, and AI industry developments as reasonably requested by the Company from time to time.')}
  <p class="note">Note: The Parties may agree to additional or modified service categories by written amendment to this Annexure.</p>

</div>
<div class="conf-footer">This agreement is private and confidential. &nbsp;│&nbsp; CIN: ${CO_CIN}</div>
</div>


<!-- ══════════════════ PAGE 8 — Annexure 2 ══════════════════════════════════ -->
<div class="page">
<div class="page-content">

  ${lh(logoUri)}

  <p class="annex-title">Annexure 2</p>
  <p class="annex-subtitle">Tax and Regulatory Details</p>
  <div class="section-heading" style="margin-top:0"></div>

  ${annexure2Body}

</div>
<div class="conf-footer">This agreement is private and confidential. &nbsp;│&nbsp; CIN: ${CO_CIN}</div>
</div>


<!-- ══════════════════ PAGE 9 — Annexure 3 ══════════════════════════════════ -->
<div class="page">
<div class="page-content">

  ${lh(logoUri)}

  <p class="annex-title">Annexure 3</p>
  <p class="annex-subtitle">Fee Schedule</p>
  <div class="section-heading" style="margin-top:0"></div>

  ${dataTable(
    ['Service Category', `Rate (${currency})`, 'Unit'],
    [
      ['Recorded Content Creation', fmtFee(fd.fee_per_recorded_hour),         'Per recorded hour'],
      ['Live Session Delivery',     fmtFee(fd.fee_per_live_session),           'Per session'],
      ['Content Creation / Review', fmtFee(fd.fee_per_content_creation_hour), 'Per hour'],
    ]
  )}

  <p class="body" style="margin-top:10pt"><strong>Currency:</strong> ${e(currency)}</p>
  <p class="body"><strong>Payment Terms:</strong> The Company shall process payment within ${invoiceDays} days from receipt of a valid, undisputed invoice.</p>
  <p class="note">Note: All rates are subject to applicable taxes as detailed in Annexure 2. Rates may be revised by mutual written agreement of the Parties.</p>

</div>
<div class="conf-footer">This agreement is private and confidential. &nbsp;│&nbsp; CIN: ${CO_CIN}</div>
</div>


</body>
</html>`;
}

module.exports = generateMSAHtml;
