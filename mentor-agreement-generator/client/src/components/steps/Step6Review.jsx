function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function Row({ label, value, missing }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-2 pr-4 text-xs font-semibold text-brand-gray w-1/2">{label}</td>
      <td className={`py-2 text-sm font-medium ${missing ? 'text-red-500' : 'text-brand-navy'}`}>
        {missing ? '⚠ Not provided' : (value || '—')}
      </td>
    </tr>
  );
}

function Section({ title, rows }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold text-brand-deep uppercase tracking-widest mb-2">{title}</p>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full px-4">
          <tbody className="divide-y divide-gray-50">
            {rows.map((r, i) => (
              <Row key={i} label={r.label} value={r.value} missing={r.missing} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Step6Review({ formData, onGenerate, loading }) {
  const isIndian  = formData.is_india_resident === 'yes';
  const currency  = formData.fee_currency === 'Other'
    ? (formData.fee_currency_custom || '')
    : (formData.fee_currency || 'INR');

  const requiredFields = [
    formData.mentor_name, formData.mentor_country_of_residence,
    formData.mentor_address, formData.mentor_email,
    formData.mentor_business_description, formData.execution_date,
    formData.mentor_tax_id, formData.mentor_entity_type,
    formData.fee_per_recorded_hour, formData.fee_per_live_session,
    formData.fee_per_content_creation_hour, formData.invoice_processing_days,
    formData.company_signatory_name, formData.company_signatory_designation,
  ];
  const allFilled = requiredFields.every(v => v !== '' && v !== null && v !== undefined);

  return (
    <div>
      <h2 className="section-title">Step 6 — Review & Generate</h2>
      <p className="text-brand-gray text-sm mb-6">
        Review all details before generating. Fields marked ⚠ are missing required values — go back to correct them.
      </p>

      <Section title="Residency" rows={[
        { label: 'India Resident', value: formData.is_india_resident === 'yes' ? 'Yes' : 'No', missing: !formData.is_india_resident },
      ]} />

      <Section title="Personal Details" rows={[
        { label: 'Full Name',          value: formData.mentor_name,                   missing: !formData.mentor_name },
        { label: 'Country',            value: formData.mentor_country_of_residence,   missing: !formData.mentor_country_of_residence },
        { label: 'Address',            value: formData.mentor_address,                missing: !formData.mentor_address },
        { label: 'Email',              value: formData.mentor_email,                  missing: !formData.mentor_email },
        { label: 'Expertise',          value: formData.mentor_business_description,   missing: !formData.mentor_business_description },
        { label: 'Execution Date',     value: fmtDate(formData.execution_date),       missing: !formData.execution_date },
      ]} />

      <Section title="Tax Details" rows={[
        ...(isIndian ? [] : [{ label: 'Tax ID Type', value: formData.mentor_tax_id_type, missing: !formData.mentor_tax_id_type }]),
        { label: isIndian ? 'PAN' : 'Tax ID',         value: formData.mentor_tax_id,          missing: !formData.mentor_tax_id },
        { label: 'Entity Type',                        value: formData.mentor_entity_type,     missing: !formData.mentor_entity_type },
        ...(formData.mentor_entity_type === 'Registered Entity'
          ? [{ label: 'Entity Name', value: formData.mentor_entity_name, missing: !formData.mentor_entity_name }]
          : []),
        ...(isIndian ? [
          { label: 'GSTIN', value: formData.mentor_gstin || 'Not provided' },
          ...(formData.mentor_gstin
            ? [{ label: 'GST Treatment', value: `${formData.fees_inclusive_exclusive_gst} of GST`, missing: !formData.fees_inclusive_exclusive_gst }]
            : []),
        ] : []),
      ]} />

      <Section title="Commercial Terms" rows={[
        { label: 'Currency',                      value: currency,                                          missing: !currency },
        { label: 'Fee — Recorded Hour',           value: `${currency} ${Number(formData.fee_per_recorded_hour || 0).toFixed(2)}`,          missing: !formData.fee_per_recorded_hour },
        { label: 'Fee — Live Session',            value: `${currency} ${Number(formData.fee_per_live_session || 0).toFixed(2)}`,           missing: !formData.fee_per_live_session },
        { label: 'Fee — Content Creation Hour',   value: `${currency} ${Number(formData.fee_per_content_creation_hour || 0).toFixed(2)}`,  missing: !formData.fee_per_content_creation_hour },
        { label: 'Invoice Processing',            value: `${formData.invoice_processing_days} days`,        missing: !formData.invoice_processing_days },
      ]} />

      <Section title="Company Signatory" rows={[
        { label: 'Name',        value: formData.company_signatory_name,        missing: !formData.company_signatory_name },
        { label: 'Designation', value: formData.company_signatory_designation, missing: !formData.company_signatory_designation },
      ]} />

      {!allFilled && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          Some required fields are missing. Go back and complete them before generating.
        </div>
      )}

      <button
        className="btn-primary w-full py-3 text-base"
        onClick={onGenerate}
        disabled={!allFilled || loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Generating MSA…
          </span>
        ) : (
          '↓ Generate & Download MSA (.docx)'
        )}
      </button>

      <p className="text-center text-xs text-brand-gray mt-3">
        The .docx file will download automatically. Open in Microsoft Word or Google Docs.
      </p>
    </div>
  );
}
