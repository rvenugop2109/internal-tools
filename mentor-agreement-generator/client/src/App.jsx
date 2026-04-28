import { useState } from 'react';
import StepIndicator from './components/StepIndicator.jsx';
import Step1Residency from './components/steps/Step1Residency.jsx';
import Step2PersonalDetails from './components/steps/Step2PersonalDetails.jsx';
import Step3TaxDetails from './components/steps/Step3TaxDetails.jsx';
import Step4CommercialTerms from './components/steps/Step4CommercialTerms.jsx';
import Step5CompanySignatory from './components/steps/Step5CompanySignatory.jsx';
import Step6Review from './components/steps/Step6Review.jsx';

const TODAY = new Date().toISOString().split('T')[0];

const INITIAL = {
  is_india_resident: '',
  mentor_name: '',
  mentor_country_of_residence: '',
  mentor_address: '',
  mentor_email: '',
  mentor_business_description: '',
  execution_date: TODAY,
  mentor_tax_id_type: '',
  mentor_tax_id: '',
  mentor_entity_type: '',
  mentor_entity_name: '',
  mentor_gstin: '',
  fees_inclusive_exclusive_gst: 'exclusive',
  fee_currency: '',
  fee_currency_custom: '',
  fee_per_recorded_hour: '',
  fee_per_live_session: '',
  fee_per_content_creation_hour: '',
  invoice_processing_days: 30,
  company_signatory_name: 'Rakesh Venugopalan',
  company_signatory_designation: 'Founder & CEO',
};

const STEPS = ['Residency', 'Personal Details', 'Tax Details', 'Commercial Terms', 'Signatory', 'Review & Generate'];

export default function App() {
  const [step, setStep]       = useState(1);
  const [formData, setFormData] = useState(INITIAL);
  const [toast, setToast]     = useState(null);
  const [loading, setLoading] = useState(false);

  function update(fields) {
    setFormData(prev => ({ ...prev, ...fields }));
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-msa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Generation failed');
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const safe = formData.mentor_name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
      a.href     = url;
      a.download = `Mellone_MSA_${safe}_${formData.execution_date}.docx`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('MSA generated and downloaded successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const stepProps = { formData, update };

  return (
    <div className="min-h-screen bg-brand-offwhite py-10 px-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-brand-deep tracking-wide uppercase">MELLONE</h1>
        <p className="text-brand-peri text-sm mt-1 font-semibold tracking-widest">MENTOR SERVICES AGREEMENT GENERATOR</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <StepIndicator current={step} steps={STEPS} />

        <div className="card mt-6">
          {step === 1 && <Step1Residency {...stepProps} />}
          {step === 2 && <Step2PersonalDetails {...stepProps} />}
          {step === 3 && <Step3TaxDetails {...stepProps} />}
          {step === 4 && <Step4CommercialTerms {...stepProps} />}
          {step === 5 && <Step5CompanySignatory {...stepProps} />}
          {step === 6 && <Step6Review {...stepProps} onGenerate={generate} loading={loading} />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            className="btn-secondary"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
          >
            ← Back
          </button>

          {step < 6 && (
            <StepNextButton step={step} formData={formData} onNext={() => setStep(s => s + 1)} />
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white font-semibold text-sm z-50 transition-all
          ${toast.type === 'success' ? 'bg-brand-deep' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// Validates the current step before advancing
function StepNextButton({ step, formData, onNext }) {
  const [errors, setErrors] = useState([]);

  function validate() {
    const errs = [];
    if (step === 1) {
      if (!formData.is_india_resident) errs.push('Please select a residency option.');
    }
    if (step === 2) {
      if (!formData.mentor_name || formData.mentor_name.trim().split(/\s+/).length < 2)
        errs.push('Full name must contain at least two words.');
      if (!formData.mentor_country_of_residence) errs.push('Country of residence is required.');
      if (!formData.mentor_address) errs.push('Address is required.');
      if (!formData.mentor_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mentor_email))
        errs.push('Valid email is required.');
      if (!formData.mentor_business_description) errs.push('Business description is required.');
      if (!formData.execution_date) errs.push('Execution date is required.');
    }
    if (step === 3) {
      if (!formData.mentor_tax_id) errs.push('Tax ID is required.');
      if (formData.is_india_resident === 'yes') {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.mentor_tax_id))
          errs.push('PAN must follow format: AAAAA9999A');
        if (formData.mentor_gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.mentor_gstin))
          errs.push('GSTIN format is invalid.');
      } else {
        if (!formData.mentor_tax_id_type) errs.push('Tax ID type is required.');
      }
      if (!formData.mentor_entity_type) errs.push('Entity type is required.');
      if (formData.mentor_entity_type === 'Registered Entity' && !formData.mentor_entity_name)
        errs.push('Entity name is required for Registered Entity.');
    }
    if (step === 4) {
      if (formData.is_india_resident !== 'yes' && !formData.fee_currency)
        errs.push('Currency is required.');
      if (formData.fee_currency === 'Other' && !formData.fee_currency_custom)
        errs.push('Please specify the currency.');
      if (!formData.fee_per_recorded_hour || Number(formData.fee_per_recorded_hour) <= 0)
        errs.push('Fee per recorded hour must be a positive number.');
      if (!formData.fee_per_live_session || Number(formData.fee_per_live_session) <= 0)
        errs.push('Fee per live session must be a positive number.');
      if (!formData.fee_per_content_creation_hour || Number(formData.fee_per_content_creation_hour) <= 0)
        errs.push('Fee per content creation hour must be a positive number.');
      if (!formData.invoice_processing_days || Number(formData.invoice_processing_days) <= 0)
        errs.push('Invoice processing days must be a positive integer.');
    }
    if (step === 5) {
      if (!formData.company_signatory_name) errs.push('Signatory name is required.');
      if (!formData.company_signatory_designation) errs.push('Signatory designation is required.');
    }
    return errs;
  }

  function handleNext() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
    } else {
      setErrors([]);
      onNext();
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {errors.length > 0 && (
        <ul className="text-xs text-red-500 text-right space-y-0.5">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
      <button className="btn-primary" onClick={handleNext}>
        Next →
      </button>
    </div>
  );
}
