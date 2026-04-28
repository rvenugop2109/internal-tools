'use strict';

const {
  Document, Paragraph, TextRun, Table, TableRow, TableCell,
  Packer, AlignmentType, WidthType, BorderStyle, Header, Footer,
  PageNumber, ShadingType, PageBreak, UnderlineType,
} = require('docx');

// ─── Constants (never exposed as form fields) ───────────────────────────────
const TERM_YEARS              = 1;
const RENEWAL_NOTICE          = { days: 60, words: 'Sixty' };
const TERMINATION_NOTICE      = { days: 30, words: 'Thirty' };
const REVIEW_WINDOW           = { days: 15, words: 'Fifteen' };
const REVISION_DAYS           = { days: 10, words: 'Ten' };
const DISPUTE_WINDOW          = { days: 15, words: 'Fifteen' };
const POST_TERM_INVOICE       = { days: 10, words: 'Ten' };
const COHORT_CANCEL_NOTICE    = { days: 7,  words: 'Seven' };
const PROGRAMME_INTIMATION    = { days: 14, words: 'Fourteen' };
const COMMUNITY_PLATFORMS     = 'WhatsApp/Discord';
const SOCIAL_POSTS_PER_COHORT = '2–3';

// ─── Style constants ─────────────────────────────────────────────────────────
const FONT  = 'Calibri';
const C     = {
  deepBlue : '1A1AE6',
  midBlue  : '3333CC',
  periwinkle: '7B7BE8',
  darkNavy : '1C1C2E',
  offWhite : 'F4F4FB',
  white    : 'FFFFFF',
  lightGray: 'E8E8F0',
};

// ─── Run helpers ─────────────────────────────────────────────────────────────
function r(text, opts = {}) {
  return new TextRun({ text, font: FONT, size: 22, color: C.darkNavy, ...opts });
}

function rb(text, opts = {}) {
  return r(text, { bold: true, ...opts });
}

function ri(text, opts = {}) {
  return r(text, { italics: true, ...opts });
}

// ─── Paragraph helpers ───────────────────────────────────────────────────────
function p(children, opts = {}) {
  const runs = typeof children === 'string' ? [r(children)] : children;
  return new Paragraph({
    children: runs,
    spacing: { after: 160, line: 276 },
    ...opts,
  });
}

function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, bold: true, size: 28, color: C.deepBlue, allCaps: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 240 },
  });
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, bold: true, size: 24, color: C.midBlue })],
    spacing: { before: 400, after: 200 },
  });
}

function clauseHead(text) {
  return new Paragraph({
    children: [new TextRun({
      text, font: FONT, bold: true, size: 22, color: C.deepBlue,
      underline: { type: UnderlineType.SINGLE },
    })],
    spacing: { before: 320, after: 160 },
  });
}

function subClause(number, content) {
  return new Paragraph({
    children: [rb(`${number}  `, { color: C.darkNavy }), ...( typeof content === 'string' ? [r(content)] : content )],
    spacing: { after: 140, line: 276 },
    indent: { left: 360, hanging: 360 },
  });
}

function indent(children, opts = {}) {
  return p(children, { indent: { left: 360 }, ...opts });
}

function spacer(pts = 120) {
  return new Paragraph({ children: [], spacing: { after: pts } });
}

function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}

function divider() {
  return new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.deepBlue } },
    spacing: { before: 200, after: 200 },
  });
}

function centred(children) {
  return p(children, { alignment: AlignmentType.CENTER });
}

// ─── Table helpers ────────────────────────────────────────────────────────────
const TABLE_WIDTH = 9360;

function noBorder() {
  const nb = { style: BorderStyle.NONE, size: 0, color: 'auto' };
  return { top: nb, bottom: nb, left: nb, right: nb, insideH: nb, insideV: nb };
}

function thinBorder(color = C.lightGray) {
  const b = { style: BorderStyle.SINGLE, size: 4, color };
  return { top: b, bottom: b, left: b, right: b, insideH: b, insideV: b };
}

function dataTable(headers, rows) {
  const colW = Math.floor(TABLE_WIDTH / headers.length);

  const hRow = new TableRow({
    tableHeader: true,
    children: headers.map(h =>
      new TableCell({
        children: [new Paragraph({
          children: [rb(h, { color: C.white, size: 20 })],
          alignment: AlignmentType.LEFT,
          spacing: { before: 80, after: 80, left: 120 },
        })],
        shading: { fill: C.deepBlue, type: ShadingType.CLEAR, color: 'auto' },
        width: { size: colW, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
      })
    ),
  });

  const dRows = rows.map((row, i) =>
    new TableRow({
      children: row.map(cell =>
        new TableCell({
          children: [new Paragraph({
            children: [r(cell, { size: 20 })],
            spacing: { before: 60, after: 60, left: 120 },
          })],
          shading: { fill: i % 2 === 0 ? C.offWhite : C.white, type: ShadingType.CLEAR, color: 'auto' },
          width: { size: colW, type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
        })
      ),
    })
  );

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    borders: thinBorder(),
    rows: [hRow, ...dRows],
  });
}

function twoColTable(left, right) {
  const halfW = Math.floor(TABLE_WIDTH / 2);
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    borders: noBorder(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: left,
            width: { size: halfW, type: WidthType.DXA },
            margins: { top: 0, bottom: 0, right: 360 },
          }),
          new TableCell({
            children: right,
            width: { size: halfW, type: WidthType.DXA },
            margins: { top: 0, bottom: 0, left: 360 },
          }),
        ],
      }),
    ],
  });
}

// ─── Date formatter ───────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

// ─── Main export ─────────────────────────────────────────────────────────────
async function generateMSA(fd) {
  const isIndian = fd.is_india_resident === 'yes';
  const currency = fd.fee_currency === 'Other' ? (fd.fee_currency_custom || 'Other') : (fd.fee_currency || 'INR');
  const entityLabel = fd.mentor_entity_type === 'Registered Entity' && fd.mentor_entity_name
    ? `${fd.mentor_entity_name} (${fd.mentor_entity_type})`
    : fd.mentor_entity_type || 'Individual';
  const invoiceDays = fd.invoice_processing_days || 30;
  const execDate   = fmtDate(fd.execution_date);
  const taxIdType  = isIndian ? 'PAN' : (fd.mentor_tax_id_type || 'Tax ID');

  // ─── Header ──────────────────────────────────────────────────────────────
  const docHeader = new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'MELLONE', font: FONT, bold: true, size: 28, color: C.deepBlue, allCaps: true }),
          new TextRun({ text: '  ·  Mentor Services Agreement', font: FONT, size: 18, color: C.periwinkle }),
        ],
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.deepBlue } },
        spacing: { after: 120 },
      }),
    ],
  });

  // ─── Footer ──────────────────────────────────────────────────────────────
  const docFooter = new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'Confidential  ·  ', font: FONT, size: 16, color: C.periwinkle }),
          new TextRun({ text: 'Page ', font: FONT, size: 16, color: C.periwinkle }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: C.periwinkle }),
          new TextRun({ text: '  ·  Mellone Private Limited', font: FONT, size: 16, color: C.periwinkle }),
        ],
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.lightGray } },
        spacing: { before: 120 },
      }),
    ],
  });

  // ─── Document body ────────────────────────────────────────────────────────
  const children = [

    // ── Title ──
    centred([new TextRun({ text: 'MENTOR SERVICES AGREEMENT', font: FONT, bold: true, size: 36, color: C.deepBlue, allCaps: true })]),
    spacer(80),
    centred([r(`Dated: ${execDate}`, { size: 22, color: C.midBlue })]),
    divider(),
    spacer(80),

    // ── Parties ──
    h2('PARTIES'),
    p([rb('1. '), rb('Mellone Private Limited'), r(', a company incorporated under the Companies Act, 2013, having its registered office at Bengaluru, Karnataka, India (hereinafter referred to as '), rb('"Company"'), r(');')]),
    spacer(80),
    p([rb('2. '), rb(fd.mentor_name), r(`, a citizen of ${fd.mentor_country_of_residence}, having ${taxIdType} ${fd.mentor_tax_id}, residing at ${fd.mentor_address} (hereinafter referred to as `), rb('"Mentor"'), r(').')]),
    spacer(80),
    p([r('(The Company and the Mentor are hereinafter individually referred to as a '), rb('"Party"'), r(' and collectively as the '), rb('"Parties"'), r('.)') ]),
    divider(),

    // ── Recitals ──
    h2('RECITALS'),
    subClause('A.', 'The Company is engaged in the business of providing AI training, consulting, and education services to professionals and organisations.'),
    subClause('B.', `The Mentor possesses expertise and experience in ${fd.mentor_business_description} and is desirous of providing mentoring, training, and content creation services to the Company.`),
    subClause('C.', 'The Company desires to engage the Mentor as an independent contractor to provide certain services, and the Mentor desires to provide such services, on the terms and conditions set out in this Agreement.'),
    spacer(80),
    p([rb('NOW, THEREFORE'), r(', in consideration of the mutual promises and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:')]),
    divider(),

    // ── CLAUSE 1: DEFINITIONS ──
    clauseHead('CLAUSE 1: DEFINITIONS'),
    p('In this Agreement, unless the context otherwise requires:'),
    subClause('1.1', [rb('"Agreement"'), r(' means this Mentor Services Agreement together with all Annexures attached hereto.')]),
    subClause('1.2', [rb('"Cohort"'), r(' means a batch of learners enrolled for a specific programme or course offered by the Company.')]),
    subClause('1.3', [rb('"Company Materials"'), r(' means any proprietary materials, curriculum, course frameworks, platform access, brand guidelines, or other intellectual property provided by the Company to the Mentor.')]),
    subClause('1.4', [rb('"Confidential Information"'), r(' means any non-public information disclosed by one Party to the other, including but not limited to business plans, pricing, learner data, curriculum content, technology, and operational information.')]),
    subClause('1.5', [rb('"Deliverables"'), r(' means any content, materials, recordings, documents, or other outputs created by the Mentor in connection with the Services.')]),
    subClause('1.6', [rb('"Effective Date"'), r(` means ${execDate}.`)]),
    subClause('1.7', [rb('"Services"'), r(' means the mentoring, training, content creation, and related services described in Annexure 1.')]),
    subClause('1.8', [rb('"Term"'), r(' means the duration of this Agreement as set out in Clause 7.1.')]),

    // ── CLAUSE 2: SCOPE ──
    clauseHead('CLAUSE 2: APPOINTMENT AND SCOPE OF SERVICES'),
    subClause('2.1', 'The Company hereby engages the Mentor as an independent contractor, and the Mentor accepts such engagement, to provide the Services as described in Annexure 1.'),
    subClause('2.2', [rb('Recorded Content: '), r('The Mentor shall create high-quality recorded instructional content as directed by the Company. All recordings shall meet the technical and content specifications communicated by the Company from time to time.')]),
    subClause('2.3', [rb('Live Sessions: '), r(`The Mentor shall conduct live training sessions, workshops, and Q&A sessions for Cohorts as scheduled by mutual agreement. In the event the Company cancels a scheduled live session, the Company shall provide the Mentor with at least ${COHORT_CANCEL_NOTICE.words} (${COHORT_CANCEL_NOTICE.days}) days' prior written notice.`)]),
    subClause('2.4', [rb('Content Review and Revision: '), r(`The Mentor shall review content developed by the Company upon request. The Company shall have ${REVIEW_WINDOW.words} (${REVIEW_WINDOW.days}) days to review Deliverables submitted by the Mentor and provide feedback. The Mentor shall complete all revisions within ${REVISION_DAYS.words} (${REVISION_DAYS.days}) days of receiving feedback.`)]),
    subClause('2.5', [rb('Community Engagement: '), r(`The Mentor shall actively engage with learners and Cohort participants on community platforms (${COMMUNITY_PLATFORMS}) as designated by the Company.`)]),
    subClause('2.6', [rb('Programme Promotion: '), r(`The Mentor shall support the promotion of the Company's programmes by making ${SOCIAL_POSTS_PER_COHORT} social media posts per Cohort, in a format and with content approved by the Company.`)]),
    subClause('2.7', [rb('Programme Intimation: '), r(`The Company shall inform the Mentor of upcoming programme schedules at least ${PROGRAMME_INTIMATION.words} (${PROGRAMME_INTIMATION.days}) days in advance of the first session.`)]),
    subClause('2.8', 'The Mentor shall perform all Services with due skill, care, and diligence, in accordance with applicable professional standards and the Company\'s reasonable instructions.'),

    // ── CLAUSE 3: FEES, INVOICING, TAXES ──
    clauseHead('CLAUSE 3: FEES, INVOICING, AND TAXES'),
    subClause('3.1', [rb('Fees: '), r('In consideration of the Services, the Company shall pay the Mentor the fees as set out in Annexure 3.')]),
    subClause('3.2', [rb('Invoicing: '), r('The Mentor shall submit invoices to the Company in accordance with the fee structure set out in Annexure 3. Invoices shall be submitted at the completion of each engagement or as otherwise mutually agreed in writing.')]),
    subClause('3.3', [rb('Payment: '), r(`The Company shall process and remit payment within ${invoiceDays} days from the date of receipt of a valid, undisputed invoice.`)]),
    subClause('3.4', [rb('Disputed Invoices: '), r(`In the event of any invoice dispute, the Company shall notify the Mentor within ${DISPUTE_WINDOW.words} (${DISPUTE_WINDOW.days}) days of receipt of the invoice, specifying the grounds for dispute. The Parties shall endeavour to resolve the dispute in good faith within ${DISPUTE_WINDOW.words} (${DISPUTE_WINDOW.days}) days of such notification.`)]),

    ...(isIndian ? [
      subClause('3.5', [rb('Tax Deducted at Source (TDS): '), r('The Company shall deduct tax at source (TDS) from all payments made to the Mentor at the applicable rate under the Income Tax Act, 1961, and shall issue Form 16A and other TDS certificates as required by law. The Mentor shall be solely responsible for filing their income tax returns.')]),
      ...(fd.mentor_gstin ? [
        subClause('3.6', [rb('Goods and Services Tax (GST): '), r(`The Mentor is registered under the Goods and Services Tax Act. GST shall be treated as ${fd.fees_inclusive_exclusive_gst || 'exclusive'} of the Fees as specified in Annexure 2. The Mentor shall be solely responsible for GST compliance, filing returns, and remitting GST to the relevant government authorities.`)]),
      ] : [
        subClause('3.6', [rb('Goods and Services Tax (GST): '), r('The Mentor has not provided a GSTIN. GST obligations, if any arise in future, shall be dealt with by way of written amendment to this Agreement.')]),
      ]),
    ] : [
      subClause('3.5', [rb('Tax Responsibilities: '), r(`The Mentor shall be solely responsible for all taxes, levies, duties, and contributions imposed by any government authority in the Mentor's country of residence or any other jurisdiction, arising from or in connection with fees received under this Agreement. The Mentor shall indemnify the Company against any claim, demand, or liability arising from the Mentor's failure to comply with their tax obligations.`)]),
      subClause('3.6', [rb('Withholding: '), r(`The Company shall withhold taxes from payments to the Mentor only where required by the Indian Income Tax Act, 1961 or the applicable Double Taxation Avoidance Agreement (DTAA) between India and ${fd.mentor_country_of_residence}. The Company shall provide the Mentor with appropriate certificates for any amounts so withheld.`)]),
    ]),

    // ── CLAUSE 4: IP ──
    clauseHead('CLAUSE 4: INTELLECTUAL PROPERTY RIGHTS'),
    subClause('4.1', [rb('Assignment of Deliverables: '), r('All Deliverables created by the Mentor in connection with the Services shall be the exclusive property of the Company from the moment of creation. The Mentor hereby irrevocably assigns to the Company all right, title, and interest in and to the Deliverables, including all copyright, neighbouring rights, and any other intellectual property rights therein.')]),
    subClause('4.2', [rb('Moral Rights: '), r('The Mentor hereby waives all moral rights in respect of the Deliverables to the fullest extent permitted by applicable law.')]),
    subClause('4.3', [rb('Pre-Existing IP: '), r('The Mentor retains ownership of any intellectual property owned by the Mentor prior to the Effective Date ("Pre-Existing IP"). To the extent that any Pre-Existing IP is incorporated into the Deliverables, the Mentor grants the Company a non-exclusive, irrevocable, royalty-free, worldwide licence to use, reproduce, and modify such Pre-Existing IP solely as part of the Deliverables.')]),
    subClause('4.4', [rb('Company Materials: '), r('The Mentor acknowledges that all Company Materials remain the exclusive property of the Company. The Mentor shall not use Company Materials for any purpose other than the performance of the Services.')]),
    subClause('4.5', [rb('Publicity: '), r("The Mentor grants the Company the right to use the Mentor's name, biographical information, photograph, and likeness in connection with the promotion of the Company's programmes and services during the Term.")]),

    // ── CLAUSE 5: CONFIDENTIALITY ──
    clauseHead('CLAUSE 5: CONFIDENTIALITY'),
    subClause('5.1', [rb('Obligation: '), r('Each Party ("Receiving Party") shall keep confidential all Confidential Information disclosed by the other Party ("Disclosing Party") and shall not disclose such information to any third party without the prior written consent of the Disclosing Party.')]),
    subClause('5.2', [rb('Use Restriction: '), r('Each Party shall use Confidential Information solely for the purposes of this Agreement and shall not exploit it for any other purpose.')]),
    subClause('5.3', [rb('Standard of Care: '), r("Each Party shall protect the Confidential Information of the other Party with at least the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care.")]),
    subClause('5.4', [rb('Exceptions: '), r('The obligations in this Clause shall not apply to information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was rightfully known to the Receiving Party before disclosure; (c) is independently developed by the Receiving Party without reference to the Confidential Information; or (d) is required to be disclosed by applicable law, provided the Receiving Party gives prompt prior written notice to the Disclosing Party.')]),
    subClause('5.5', [rb('Survival: '), r('The obligations in this Clause shall survive the termination or expiry of this Agreement for a period of three (3) years.')]),

    // ── CLAUSE 6: NON-SOLICITATION ──
    clauseHead('CLAUSE 6: NON-SOLICITATION'),
    subClause('6.1', [rb('Non-Solicitation of Learners and Clients: '), r('During the Term and for a period of twelve (12) months following the termination or expiry of this Agreement, the Mentor shall not, directly or indirectly, solicit, approach, or accept business from any learner, client, or prospective client of the Company with whom the Mentor came into contact through the performance of the Services.')]),
    subClause('6.2', [rb('Non-Solicitation of Personnel: '), r('During the Term and for a period of twelve (12) months following termination or expiry, the Mentor shall not directly or indirectly solicit, hire, or engage any employee, contractor, or agent of the Company.')]),

    // ── CLAUSE 7: TERM AND TERMINATION ──
    clauseHead('CLAUSE 7: TERM AND TERMINATION'),
    subClause('7.1', [rb('Term: '), r(`This Agreement shall commence on the Effective Date and shall continue for a period of ${TERM_YEARS === 1 ? 'one (1) year' : `${TERM_YEARS} years`}, unless earlier terminated in accordance with this Clause.`)]),
    subClause('7.2', [rb('Renewal: '), r(`This Agreement shall automatically renew for successive one (1) year periods unless either Party provides written notice of non-renewal to the other Party at least ${RENEWAL_NOTICE.words} (${RENEWAL_NOTICE.days}) days prior to the expiry of the then-current term.`)]),
    subClause('7.3', [rb('Termination for Convenience: '), r(`Either Party may terminate this Agreement for any reason by providing ${TERMINATION_NOTICE.words} (${TERMINATION_NOTICE.days}) days' prior written notice to the other Party.`)]),
    subClause('7.4', [rb('Termination for Cause: '), r('Either Party may terminate this Agreement immediately upon written notice if the other Party: (a) materially breaches this Agreement and fails to cure such breach within fourteen (14) days of receiving written notice thereof; (b) becomes insolvent, bankrupt, or makes an assignment for the benefit of creditors; or (c) engages in fraud, wilful misconduct, or criminal activity.')]),
    subClause('7.5', [rb('Post-Termination Invoicing: '), r(`Upon termination or expiry of this Agreement, the Mentor shall submit all outstanding invoices for Services rendered prior to the date of termination within ${POST_TERM_INVOICE.words} (${POST_TERM_INVOICE.days}) days of the termination date. The Company shall not be obligated to pay any invoice submitted after this period.`)]),
    subClause('7.6', [rb('Effect of Termination: '), r("Upon termination or expiry: (a) each Party shall promptly return or destroy all Confidential Information of the other Party; (b) the Mentor shall immediately cease use of all Company Materials; (c) clauses that by their nature survive termination (including Clauses 4, 5, 6, 8, and 9) shall continue in effect.")]),

    // ── CLAUSE 8: REPRESENTATIONS ──
    clauseHead('CLAUSE 8: REPRESENTATIONS AND WARRANTIES'),
    subClause('8.1', [rb('Company Representations: '), r('The Company represents and warrants that: (a) it has full power and authority to enter into this Agreement; (b) execution and performance of this Agreement does not violate any agreement to which the Company is a party; and (c) it shall make payments to the Mentor in a timely manner in accordance with this Agreement.')]),
    subClause('8.2', [rb('Mentor Representations: '), r('The Mentor represents and warrants that: (a) the Mentor has full power and authority to enter into this Agreement; (b) execution and performance of this Agreement does not violate any agreement to which the Mentor is a party; (c) the Mentor possesses the skills, qualifications, and experience necessary to perform the Services; (d) the Deliverables will be original works and will not infringe any third-party intellectual property rights; and (e) the Mentor will comply with all applicable laws and regulations in the performance of the Services.')]),

    // ── CLAUSE 9: GENERAL PROVISIONS ──
    clauseHead('CLAUSE 9: GENERAL PROVISIONS'),
    subClause('9.1', [rb('Independent Contractor: '), r('The Mentor is an independent contractor. Nothing in this Agreement shall be construed to create an employer-employee relationship, partnership, joint venture, or agency between the Parties. The Mentor shall be solely responsible for all taxes, social security contributions, insurance, and other obligations arising from the independent contractor relationship.')]),
    subClause('9.2', [rb('Entire Agreement: '), r('This Agreement, together with its Annexures, constitutes the entire agreement between the Parties with respect to its subject matter and supersedes all prior agreements, representations, and understandings.')]),
    subClause('9.3', [rb('Amendments: '), r('No amendment or modification of this Agreement shall be valid unless made in writing and signed by authorised representatives of both Parties.')]),
    subClause('9.4', [rb('Waiver: '), r("The failure of either Party to enforce any provision of this Agreement shall not be construed as a waiver of that Party's right to enforce such provision in the future.")]),
    subClause('9.5', [rb('Severability: '), r('If any provision of this Agreement is held to be invalid or unenforceable, such provision shall be modified to the minimum extent necessary to make it valid and enforceable, and the remaining provisions shall continue in full force and effect.')]),
    subClause('9.6', [rb('Notices: '), r('All notices under this Agreement shall be in writing and delivered by email (with acknowledgement of receipt) or courier to the addresses specified in this Agreement or such other addresses as may be notified by a Party in writing from time to time.')]),
    subClause('9.7', [rb('Force Majeure: '), r('Neither Party shall be liable for any delay or failure in performance resulting from causes beyond its reasonable control, including acts of God, government actions, pandemics, or natural disasters, provided the affected Party gives prompt written notice to the other Party and uses reasonable endeavours to mitigate the impact.')]),
    subClause('9.8', [rb('Assignment: '), r("The Mentor may not assign or transfer any rights or obligations under this Agreement without the prior written consent of the Company. The Company may assign this Agreement to any affiliate or successor entity without the Mentor's consent, provided the Company notifies the Mentor in writing.")]),

    ...(isIndian ? [
      subClause('9.9', [rb('Governing Law and Jurisdiction: '), r('This Agreement shall be governed by and construed in accordance with the laws of India. The Parties irrevocably submit to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India for the resolution of any disputes arising out of or in connection with this Agreement.')]),
    ] : [
      subClause('9.9', [rb('Governing Law and Jurisdiction: '), r(`This Agreement shall be governed by and construed in accordance with the laws of India. The Parties submit to the non-exclusive jurisdiction of the courts in Bengaluru, Karnataka, India. By mutual written agreement, the Parties may elect to resolve any dispute through arbitration under the UNCITRAL Arbitration Rules, with the seat of arbitration in Bengaluru, India and proceedings conducted in the English language.`)]),
    ]),

    subClause('9.10', [rb('Counterparts: '), r('This Agreement may be executed in counterparts, each of which shall constitute an original, and all of which together shall constitute one and the same instrument. Electronic signatures shall be deemed valid and binding.')]),
    subClause('9.11', [rb('Language: '), r('This Agreement is written in English and all communications, notices, and documents under this Agreement shall be in English.')]),
    subClause('9.12', [rb('Relationship of Parties: '), r('Nothing in this Agreement shall be construed to create any agency, employment, partnership, or joint venture relationship between the Parties. The Mentor shall not represent itself as an agent or employee of the Company.')]),
    subClause('9.13', [rb('Headings: '), r('The headings in this Agreement are for convenience of reference only and shall not affect the construction or interpretation of this Agreement.')]),

    // ── Signature Block ──
    pb(),
    h2('SIGNATURE PAGE'),
    divider(),
    spacer(),
    p('IN WITNESS WHEREOF, the Parties have executed this Mentor Services Agreement as of the date first written above.'),
    spacer(),

    twoColTable(
      [
        p([rb('For and on behalf of')]),
        p([rb('Mellone Private Limited')]),
        spacer(200),
        p([r('Signature:  _______________________________')]),
        spacer(80),
        p([rb('Name: '), r(fd.company_signatory_name)]),
        p([rb('Designation: '), r(fd.company_signatory_designation)]),
        p([rb('Date: '), r(execDate)]),
      ],
      [
        p([rb('Mentor')]),
        spacer(200),
        p([r('Signature:  _______________________________')]),
        spacer(80),
        p([rb('Name: '), r(fd.mentor_name)]),
        p([rb('Date:  '), r('___________________')]),
      ]
    ),

    // ── ANNEXURE 1 ──
    pb(),
    h1('ANNEXURE 1'),
    h2('DESCRIPTION OF SERVICES'),
    divider(),
    p('The Mentor shall provide the following categories of services under this Agreement:'),
    spacer(80),
    subClause('1.', [rb('Recorded Content Creation: '), r('Create video lessons, tutorials, and instructional content as directed by the Company. All recordings must meet the technical and content specifications communicated by the Company.')]),
    subClause('2.', [rb('Live Sessions: '), r('Conduct live training sessions, workshops, demonstrations, and interactive Q&A sessions for Cohorts.')]),
    subClause('3.', [rb('Content Review and Quality Assurance: '), r('Review and provide structured feedback on curriculum content, course materials, and other educational content developed by or for the Company.')]),
    subClause('4.', [rb('Community Engagement: '), r(`Actively participate in and moderate learner community channels (${COMMUNITY_PLATFORMS}), respond to learner queries, and foster constructive engagement.`)]),
    subClause('5.', [rb('Programme Promotion: '), r(`Create and publish ${SOCIAL_POSTS_PER_COHORT} social media posts per Cohort to promote the Company's programmes, using approved messaging and brand guidelines.`)]),
    subClause('6.', [rb('Ad Hoc Consulting: '), r('Provide consulting and advisory input on curriculum design, pedagogical approaches, and AI industry developments as reasonably requested by the Company from time to time.')]),
    spacer(),
    p([ri('Note: '), ri('The Parties may agree to additional or modified service categories by written amendment to this Annexure.')]),

    // ── ANNEXURE 2 ──
    pb(),
    h1('ANNEXURE 2'),
    h2('TAX AND REGULATORY DETAILS'),
    divider(),
    spacer(80),

    ...(isIndian ? [
      p([rb('Mentor Tax Identification (India)')]),
      spacer(80),
      dataTable(
        ['Detail', 'Value'],
        [
          ['Full Name', fd.mentor_name],
          ['Entity Type', entityLabel],
          ['PAN', fd.mentor_tax_id],
          ['GSTIN', fd.mentor_gstin || 'Not provided'],
          ['GST Treatment', fd.mentor_gstin ? `Fees are ${fd.fees_inclusive_exclusive_gst || 'exclusive'} of GST` : 'N/A'],
        ]
      ),
      spacer(),
      clauseHead('TDS (Tax Deducted at Source)'),
      p(`The Company shall deduct TDS from all payments to the Mentor at the applicable rate under the Income Tax Act, 1961 and issue Form 16A (or other applicable TDS certificate) for each financial year.`),
      ...(fd.mentor_gstin ? [
        spacer(80),
        clauseHead('GST Compliance'),
        p(`The Mentor holds GSTIN ${fd.mentor_gstin}. GST is ${fd.fees_inclusive_exclusive_gst || 'exclusive'} of the fees in Annexure 3. The Mentor is solely responsible for GST filings and remittances.`),
      ] : []),
    ] : [
      p([rb(`Mentor Tax Identification (${fd.mentor_country_of_residence})`)]),
      spacer(80),
      dataTable(
        ['Detail', 'Value'],
        [
          ['Full Name', fd.mentor_name],
          ['Entity Type', entityLabel],
          ['Tax ID Type', fd.mentor_tax_id_type || 'Tax ID'],
          ['Tax ID', fd.mentor_tax_id],
          ['Country of Residence', fd.mentor_country_of_residence],
        ]
      ),
      spacer(),
      clauseHead('Tax Responsibility'),
      p(`The Mentor shall be solely responsible for all taxes, levies, duties, and contributions imposed in ${fd.mentor_country_of_residence} or any other jurisdiction arising from fees received under this Agreement. The Company shall withhold taxes only where mandated by the Income Tax Act, 1961 or the applicable DTAA between India and ${fd.mentor_country_of_residence}.`),
    ]),

    // ── ANNEXURE 3 ──
    pb(),
    h1('ANNEXURE 3'),
    h2('FEE SCHEDULE'),
    divider(),
    spacer(80),

    dataTable(
      ['Service Category', `Rate (${currency})`, 'Unit'],
      [
        ['Recorded Content Creation', Number(fd.fee_per_recorded_hour).toFixed(2), 'Per recorded hour'],
        ['Live Session Delivery',     Number(fd.fee_per_live_session).toFixed(2),   'Per session'],
        ['Content Creation / Review', Number(fd.fee_per_content_creation_hour).toFixed(2), 'Per hour'],
      ]
    ),
    spacer(),
    p([rb('Currency: '), r(currency)]),
    p([rb('Payment Terms: '), r(`The Company shall process payment within ${invoiceDays} days from receipt of a valid, undisputed invoice.`)]),
    spacer(80),
    p([ri('Note: '), ri('All rates are subject to applicable taxes as detailed in Annexure 2. Rates may be revised by mutual written agreement of the Parties.')]),
  ];

  const doc = new Document({
    creator: 'Mellone Private Limited',
    title: `Mentor Services Agreement – ${fd.mentor_name}`,
    description: 'Generated by Mellone MSA Tool',
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 22, color: C.darkNavy },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
        },
      },
      headers: { default: docHeader },
      footers: { default: docFooter },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}

module.exports = generateMSA;
