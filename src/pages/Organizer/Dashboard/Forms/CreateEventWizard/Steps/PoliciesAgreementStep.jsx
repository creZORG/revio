import React from 'react';
import styles from '../../../Tabs/CreateEventWizard.module.css';
import Button from '../../../../../../components/Common/Button.jsx';
import TextInput from '../../../../../../components/Common/TextInput.jsx'; // For disclaimer
import RichTextEditor from '../../../../../../components/Common/RichTextEditor.jsx'; // For custom refund policy

const PoliciesAgreementStep = ({ formData, updateFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({ [name]: type === 'checkbox' ? checked : value });
  };

  const handleRichTextChange = (content) => {
    updateFormData({ customRefundPolicyText: content });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Policies & Agreement</h3>
      <p className="text-gray-600 mb-6">Define your event policies and agree to Naks Yetu terms.</p>

      <div className={styles.formGroup}>
        <label htmlFor="refundPolicyType" className={styles.formLabel}>Refund Policy Type</label>
        <select
          id="refundPolicyType"
          name="refundPolicyType"
          value={formData.refundPolicyType}
          onChange={handleChange}
          className={styles.formSelect}
          required
        >
          <option value="Naks Yetu Standard">Naks Yetu Standard Policy (e.g., no refunds within 7 days)</option>
          <option value="Custom">Custom Policy</option>
        </select>
      </div>

      {formData.refundPolicyType === 'Custom' && (
        <div className={styles.formGroup}>
          <label htmlFor="customRefundPolicyText" className={styles.formLabel}>Custom Refund Policy Text</label>
          <RichTextEditor
            value={formData.customRefundPolicyText}
            onChange={handleRichTextChange}
            placeholder="Enter your custom refund policy details..."
          />
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="disclaimer" className={styles.formLabel}>Additional Terms/Disclaimer (Optional)</label>
        <TextInput
          id="disclaimer"
          name="disclaimer"
          value={formData.disclaimer}
          onChange={handleChange}
          isTextarea={true}
          rows={4}
          placeholder="Any specific terms or disclaimers for your event..."
        />
      </div>

      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id="naksyetuTermsAccepted"
          name="naksyetuTermsAccepted"
          checked={formData.naksyetuTermsAccepted}
          onChange={handleChange}
          className={styles.checkboxInput}
          required
        />
        <label htmlFor="naksyetuTermsAccepted" className={styles.checkboxLabel}>
          I agree to the <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Naks Yetu Terms of Service</a>.
        </label>
      </div>

      <div className={styles.buttonGroup}>
        <Button onClick={prevStep} secondary>Previous</Button>
        <Button onClick={nextStep} primary>Next</Button>
      </div>
    </div>
  );
};

export default PoliciesAgreementStep;