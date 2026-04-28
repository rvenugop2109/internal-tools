import FormField, { Input } from '../FormField.jsx';

export default function Step5CompanySignatory({ formData, update }) {
  return (
    <div>
      <h2 className="section-title">Step 5 — Company Signatory</h2>
      <p className="text-brand-gray text-sm mb-6">
        These details appear on the signature block of the agreement on behalf of Mellone Private Limited.
        Pre-filled with defaults — edit if signing authority differs.
      </p>

      <div className="p-4 bg-brand-offwhite rounded-xl border border-brand-pale mb-6">
        <p className="text-xs font-bold text-brand-deep mb-1 uppercase tracking-wide">Signing Entity</p>
        <p className="text-sm font-semibold text-brand-navy">Mellone Private Limited</p>
        <p className="text-xs text-brand-gray">Bengaluru, Karnataka, India</p>
      </div>

      <FormField label="Signatory Full Name" required>
        <Input
          value={formData.company_signatory_name}
          onChange={v => update({ company_signatory_name: v })}
          placeholder="Signatory full name"
        />
      </FormField>

      <FormField label="Designation" required>
        <Input
          value={formData.company_signatory_designation}
          onChange={v => update({ company_signatory_designation: v })}
          placeholder="e.g. Founder & CEO"
        />
      </FormField>

      <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-white text-sm">
        <p className="text-xs font-bold text-brand-gray uppercase tracking-wide mb-2">Preview</p>
        <p className="font-semibold text-brand-navy">{formData.company_signatory_name || '—'}</p>
        <p className="text-brand-gray">{formData.company_signatory_designation || '—'}</p>
        <p className="text-brand-gray text-xs mt-1">Mellone Private Limited</p>
      </div>
    </div>
  );
}
