import FormField, { Input, Select, Radio } from '../FormField.jsx';

const TAX_ID_TYPES = ['VAT Number', 'TFN', 'EIN', 'NI Number', 'Other'];

export default function Step3TaxDetails({ formData, update }) {
  const isIndian = formData.is_india_resident === 'yes';

  return (
    <div>
      <h2 className="section-title">Step 3 — Tax Details</h2>

      {isIndian ? (
        <>
          <div className="mb-4 p-3 bg-brand-pale/20 rounded-lg border border-brand-pale text-xs text-brand-navy">
            Indian mentor — PAN is required. GSTIN is optional.
          </div>

          <FormField label="PAN" required helper="Format: AAAAA9999A (5 letters · 4 digits · 1 letter)">
            <Input
              value={formData.mentor_tax_id}
              onChange={v => update({ mentor_tax_id: v.toUpperCase() })}
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          </FormField>

          <FormField label="Entity Type" required>
            <Select
              value={formData.mentor_entity_type}
              onChange={v => update({ mentor_entity_type: v, mentor_entity_name: v === 'Individual' ? '' : formData.mentor_entity_name })}
              options={['Individual', 'Registered Entity']}
              placeholder="— Select —"
            />
          </FormField>

          {formData.mentor_entity_type === 'Registered Entity' && (
            <FormField label="Registered Entity Name" required>
              <Input
                value={formData.mentor_entity_name}
                onChange={v => update({ mentor_entity_name: v })}
                placeholder="e.g. Priya Sharma Consulting LLP"
              />
            </FormField>
          )}

          <FormField label="GSTIN" helper="Optional — only if the mentor is GST-registered">
            <Input
              value={formData.mentor_gstin}
              onChange={v => update({ mentor_gstin: v.toUpperCase(), fees_inclusive_exclusive_gst: v ? formData.fees_inclusive_exclusive_gst : '' })}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
          </FormField>

          {formData.mentor_gstin && (
            <FormField label="Are the quoted fees inclusive or exclusive of GST?" required>
              <div className="flex gap-6 mt-1">
                <Radio name="gst_type" value="inclusive"  checked={formData.fees_inclusive_exclusive_gst === 'inclusive'}  onChange={v => update({ fees_inclusive_exclusive_gst: v })} label="Inclusive of GST"  />
                <Radio name="gst_type" value="exclusive"  checked={formData.fees_inclusive_exclusive_gst === 'exclusive'}  onChange={v => update({ fees_inclusive_exclusive_gst: v })} label="Exclusive of GST" />
              </div>
            </FormField>
          )}
        </>
      ) : (
        <>
          <div className="mb-4 p-3 bg-brand-pale/20 rounded-lg border border-brand-pale text-xs text-brand-navy">
            Non-Indian mentor — select the appropriate tax ID type for {formData.mentor_country_of_residence || 'the mentor\'s country'}.
          </div>

          <FormField label="Tax ID Type" required>
            <Select
              value={formData.mentor_tax_id_type}
              onChange={v => update({ mentor_tax_id_type: v })}
              options={TAX_ID_TYPES}
              placeholder="— Select —"
            />
          </FormField>

          <FormField label="Tax ID Number" required>
            <Input
              value={formData.mentor_tax_id}
              onChange={v => update({ mentor_tax_id: v })}
              placeholder="Enter tax ID number"
            />
          </FormField>

          <FormField label="Entity Type" required>
            <Select
              value={formData.mentor_entity_type}
              onChange={v => update({ mentor_entity_type: v, mentor_entity_name: v === 'Individual' ? '' : formData.mentor_entity_name })}
              options={['Individual', 'Registered Entity']}
              placeholder="— Select —"
            />
          </FormField>

          {formData.mentor_entity_type === 'Registered Entity' && (
            <FormField label="Registered Entity Name" required>
              <Input
                value={formData.mentor_entity_name}
                onChange={v => update({ mentor_entity_name: v })}
                placeholder="e.g. Priya Sharma Ltd"
              />
            </FormField>
          )}
        </>
      )}
    </div>
  );
}
