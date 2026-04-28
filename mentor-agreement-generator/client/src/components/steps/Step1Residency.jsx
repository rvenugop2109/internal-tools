import FormField, { Radio } from '../FormField.jsx';

export default function Step1Residency({ formData, update }) {
  function pick(val) {
    update({
      is_india_resident: val,
      mentor_country_of_residence: val === 'yes' ? 'India' : '',
      fee_currency: val === 'yes' ? 'INR' : '',
      mentor_tax_id_type: val === 'yes' ? 'PAN' : '',
    });
  }

  return (
    <div>
      <h2 className="section-title">Step 1 — Residency Gate</h2>
      <p className="text-brand-gray text-sm mb-6">
        The mentor's tax residency determines the applicable tax clauses, currency, and jurisdiction provisions in the agreement.
      </p>

      <FormField label="Is the mentor a tax resident of India?" required>
        <div className="flex flex-col gap-3 mt-2">
          <div className={`border rounded-xl p-4 cursor-pointer transition-all
            ${formData.is_india_resident === 'yes'
              ? 'border-brand-deep bg-brand-offwhite'
              : 'border-gray-200 hover:border-brand-peri'}`}
            onClick={() => pick('yes')}>
            <Radio
              name="residency"
              value="yes"
              checked={formData.is_india_resident === 'yes'}
              onChange={pick}
              label="Yes — the mentor is a tax resident of India"
            />
            <p className="text-xs text-brand-gray mt-1 ml-6">
              PAN required · Currency set to INR · TDS applicable · Bangalore exclusive jurisdiction
            </p>
          </div>

          <div className={`border rounded-xl p-4 cursor-pointer transition-all
            ${formData.is_india_resident === 'no'
              ? 'border-brand-deep bg-brand-offwhite'
              : 'border-gray-200 hover:border-brand-peri'}`}
            onClick={() => pick('no')}>
            <Radio
              name="residency"
              value="no"
              checked={formData.is_india_resident === 'no'}
              onChange={pick}
              label="No — the mentor is not a tax resident of India"
            />
            <p className="text-xs text-brand-gray mt-1 ml-6">
              Foreign tax ID · Choose currency · Self-responsible for local taxes · Non-exclusive jurisdiction
            </p>
          </div>
        </div>
      </FormField>

      {formData.is_india_resident && (
        <div className="mt-4 p-3 bg-brand-pale/20 rounded-lg border border-brand-pale text-xs text-brand-navy">
          {formData.is_india_resident === 'yes'
            ? '✓ Indian mentor selected. Country pre-filled as India, currency set to INR, PAN required in Step 3.'
            : '✓ Non-Indian mentor selected. You will choose currency and foreign tax ID type in later steps.'}
        </div>
      )}
    </div>
  );
}
