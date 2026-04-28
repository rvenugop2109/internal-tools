import FormField, { Input, Textarea } from '../FormField.jsx';

const TODAY = new Date().toISOString().split('T')[0];

export default function Step2PersonalDetails({ formData, update }) {
  const isIndian = formData.is_india_resident === 'yes';

  return (
    <div>
      <h2 className="section-title">Step 2 — Personal Details</h2>

      <FormField label="Full Name" required helper="Enter the mentor's legal full name (minimum two words)">
        <Input
          value={formData.mentor_name}
          onChange={v => update({ mentor_name: v })}
          placeholder="e.g. Priya Sharma"
        />
      </FormField>

      <FormField label="Country of Residence" required>
        <Input
          value={formData.mentor_country_of_residence}
          onChange={v => update({ mentor_country_of_residence: v })}
          placeholder="e.g. India"
          disabled={isIndian}
        />
        {isIndian && <p className="form-helper">Pre-filled from residency selection.</p>}
      </FormField>

      <FormField label="Address" required helper="Full residential or business address">
        <Textarea
          value={formData.mentor_address}
          onChange={v => update({ mentor_address: v })}
          placeholder="Street, City, State, PIN / Postal Code, Country"
          rows={3}
        />
      </FormField>

      <FormField label="Email Address" required>
        <Input
          type="email"
          value={formData.mentor_email}
          onChange={v => update({ mentor_email: v })}
          placeholder="mentor@example.com"
        />
      </FormField>

      <FormField label="Business / Expertise Description" required helper="Brief description of the mentor's area of expertise (used in the agreement recitals)">
        <Input
          value={formData.mentor_business_description}
          onChange={v => update({ mentor_business_description: v })}
          placeholder="e.g. Generative AI, Large Language Models, and enterprise AI deployment"
        />
      </FormField>

      <FormField label="Agreement Execution Date" required helper="Cannot be a past date">
        <Input
          type="date"
          value={formData.execution_date}
          onChange={v => update({ execution_date: v })}
          min={TODAY}
        />
      </FormField>
    </div>
  );
}
