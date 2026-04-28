import FormField, { Input, Select } from '../FormField.jsx';

const CURRENCIES = ['USD', 'GBP', 'EUR', 'AED', 'SGD', 'AUD', 'Other'];

export default function Step4CommercialTerms({ formData, update }) {
  const isIndian = formData.is_india_resident === 'yes';
  const currency = formData.fee_currency === 'Other'
    ? (formData.fee_currency_custom || 'custom currency')
    : (formData.fee_currency || '—');

  return (
    <div>
      <h2 className="section-title">Step 4 — Commercial Terms</h2>

      {isIndian ? (
        <div className="mb-4 p-3 bg-brand-pale/20 rounded-lg border border-brand-pale text-xs text-brand-navy">
          Currency is fixed to INR for Indian mentors.
        </div>
      ) : (
        <>
          <FormField label="Fee Currency" required>
            <Select
              value={formData.fee_currency}
              onChange={v => update({ fee_currency: v, fee_currency_custom: v !== 'Other' ? '' : formData.fee_currency_custom })}
              options={CURRENCIES}
              placeholder="— Select currency —"
            />
          </FormField>

          {formData.fee_currency === 'Other' && (
            <FormField label="Specify Currency Code" required helper="e.g. MUR, CHF, CAD">
              <Input
                value={formData.fee_currency_custom}
                onChange={v => update({ fee_currency_custom: v.toUpperCase() })}
                placeholder="MUR"
                maxLength={10}
              />
            </FormField>
          )}
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <FormField label={`Fee per Recorded Hour (${currency})`} required helper="Positive number, up to 2 decimal places">
          <Input
            type="number"
            value={formData.fee_per_recorded_hour}
            onChange={v => update({ fee_per_recorded_hour: v })}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </FormField>

        <FormField label={`Fee per Live Session (${currency})`} required helper="Per session delivery">
          <Input
            type="number"
            value={formData.fee_per_live_session}
            onChange={v => update({ fee_per_live_session: v })}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </FormField>

        <FormField label={`Fee per Content Creation Hour (${currency})`} required helper="Review, consulting, content work">
          <Input
            type="number"
            value={formData.fee_per_content_creation_hour}
            onChange={v => update({ fee_per_content_creation_hour: v })}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </FormField>

        <FormField label="Invoice Processing Days" required helper="Days from receipt of valid invoice (default: 30)">
          <Input
            type="number"
            value={formData.invoice_processing_days}
            onChange={v => update({ invoice_processing_days: parseInt(v, 10) || '' })}
            placeholder="30"
            min="1"
            step="1"
          />
        </FormField>
      </div>

      {(formData.fee_per_recorded_hour || formData.fee_per_live_session || formData.fee_per_content_creation_hour) && (
        <div className="mt-2 rounded-xl border border-brand-pale bg-brand-offwhite p-4">
          <p className="text-xs font-bold text-brand-deep mb-2 uppercase tracking-wide">Fee Summary</p>
          <table className="w-full text-sm text-brand-navy">
            <tbody>
              <tr className="border-b border-brand-pale/50">
                <td className="py-1.5 text-brand-gray">Recorded content (per hour)</td>
                <td className="py-1.5 font-semibold text-right">{currency} {Number(formData.fee_per_recorded_hour || 0).toFixed(2)}</td>
              </tr>
              <tr className="border-b border-brand-pale/50">
                <td className="py-1.5 text-brand-gray">Live session (per session)</td>
                <td className="py-1.5 font-semibold text-right">{currency} {Number(formData.fee_per_live_session || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-brand-gray">Content creation (per hour)</td>
                <td className="py-1.5 font-semibold text-right">{currency} {Number(formData.fee_per_content_creation_hour || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
