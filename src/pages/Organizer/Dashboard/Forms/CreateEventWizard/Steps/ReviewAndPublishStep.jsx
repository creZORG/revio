// src/pages/Organizer/Dashboard/Forms/CreateEventWizard/Steps/ReviewAndPublishStep.jsx
import React from 'react';
import commonFormStyles from '../../../Tabs/CreateEventWizard.module.css'; // Reusing for button styles
import DOMPurify from 'dompurify'; // Corrected dompurify import

// NEW: Receive isSubmitting and submissionError props
const ReviewAndPublishStep = ({ formData, handleSubmit, prevStep, isSubmitting, submissionError }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Review & Publish Your Event</h3>
      <p className="text-gray-600 mb-6">Please review all the details before publishing your event.</p>

      <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6 space-y-4">
        <h4 className="font-bold text-lg text-gray-800 border-b pb-2 mb-4">Basic Information</h4>
        <p><strong>Event Name:</strong> {formData.eventName || 'N/A'}</p>
        <p><strong>Description:</strong> <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.description || 'N/A') }} className="prose max-w-none text-sm" /></p>
        <p><strong>Banner Image:</strong> {formData.bannerImageUrl ? <img src={formData.bannerImageUrl} alt="Event Banner" className="w-full max-h-48 object-cover rounded-md" /> : 'No banner uploaded'}</p>
        <p><strong>Category:</strong> {formData.category || 'N/A'}</p>
        <p><strong>Tags:</strong> {formData.eventTags || 'None'}</p>
        <p><strong>Age Category:</strong> {formData.targetAge || 'N/A'}</p>
        <p><strong>Location:</strong> {`${formData.mainLocation || 'N/A'}, ${formData.specificAddress || 'N/A'}`}</p>
        <p><strong>Starts:</strong> {formData.startDate || 'N/A'} at {formData.startTime || 'N/A'}</p>
        {formData.endDate && <p><strong>Ends:</strong> {formData.endDate} at {formData.endTime}</p>}
        <p><strong>Contact Email:</strong> (From Organizer Profile)</p>

        <h4 className="font-bold text-lg text-gray-800 border-b pb-2 mb-4 mt-6">Event Access & Details</h4>
        <p><strong>Ticketed:</strong> {formData.isTicketed ? 'Yes' : 'No'}</p>
        {formData.isTicketed && formData.ticketTypes.length > 0 && (
            <div>
                <strong>Ticket Types:</strong>
                <ul className="list-disc list-inside ml-4">
                    {formData.ticketTypes.map((ticket, index) => (
                        <li key={index}>
                            {ticket.name} - Ksh {ticket.price} ({ticket.quantity} available)
                            {ticket.description && ` - ${ticket.description}`}
                            ({ticket.salesStartDate} {ticket.salesStartTime} to {ticket.salesEndDate} {ticket.salesEndTime})
                        </li>
                    ))}
                </ul>
            </div>
        )}
        <p><strong>Online Event:</strong> {formData.isOnlineEvent ? 'Yes' : 'No'}</p>
        {formData.isOnlineEvent && (
            <>
                <p><strong>Online URL:</strong> <a href={formData.onlineEventUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{formData.onlineEventUrl}</a></p>
                <p><strong>Online Type:</strong> {formData.onlineEventType || 'N/A'}</p>
            </>
        )}
        <p><strong>RSVP Event:</strong> {formData.isRsvp ? 'Yes' : 'No'}</p>
        {formData.isRsvp && (
            <>
                <p><strong>RSVP Capacity:</strong> {formData.rsvpCapacity || 'Unlimited'}</p>
                <p><strong>Enable Waitlist:</strong> {formData.rsvpEnableWaitlist ? 'Yes' : 'No'}</p>
                <p><strong>RSVP Questions:</strong> {formData.rsvpQuestions || 'None'}</p>
            </>
        )}
        <p><strong>Free Event:</strong> {formData.isFreeEvent ? 'Yes' : 'No'}</p>
        {formData.isFreeEvent && <p><strong>Donation Option:</strong> {formData.donationOption ? 'Yes' : 'No'}</p>}


        <h4 className="font-bold text-lg text-gray-800 border-b pb-2 mb-4 mt-6">Gallery & Sponsors</h4>
        <p><strong>Gallery Images:</strong> {formData.galleryImageUrls.length > 0 ? formData.galleryImageUrls.map((url, i) => <img key={i} src={url} alt={`Gallery ${i+1}`} className="w-24 h-24 object-cover inline-block m-1 rounded" />) : 'No gallery images'}</p>
        {formData.sponsors.length > 0 && (
            <div>
                <strong>Sponsors:</strong>
                <ul className="list-disc list-inside ml-4">
                    {formData.sponsors.map((sponsor, index) => (
                        <li key={index}>
                            {sponsor.name || 'N/A'}
                            {sponsor.logoUrl && <img src={sponsor.logoUrl} alt="Sponsor Logo" className="w-16 h-16 object-contain inline-block ml-2" />}
                            {sponsor.websiteUrl && ` - `}<a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{sponsor.websiteUrl}</a>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        <h4 className="font-bold text-lg text-gray-800 border-b pb-2 mb-4 mt-6">Policies & Terms</h4>
        <p><strong>Refund Policy:</strong> {formData.refundPolicyType || 'N/A'}</p>
        {formData.refundPolicyType === 'Custom' && formData.customRefundPolicyText && (
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.customRefundPolicyText) }} className="prose max-w-none text-sm border-l-4 border-gray-300 pl-3" />
        )}
        <p><strong>Additional Disclaimer:</strong> {formData.disclaimer || 'None'}</p>
        <p><strong>Naks Yetu Terms Accepted:</strong> {formData.naksyetuTermsAccepted ? 'Yes' : 'No'}</p>
      </div>

      <div className={commonFormStyles.checkboxContainer}>
        <input
          type="checkbox"
          id="confirmPublish"
          name="confirmPublish"
          checked={formData.naksyetuTermsAccepted} // This should reflect the actual agreement from step 4
          readOnly // Make it read-only
          className={commonFormStyles.checkboxInput}
        />
        <label htmlFor="confirmPublish" className={commonFormStyles.checkboxLabel}>
          I confirm all information is accurate and I am ready to publish this event.
        </label>
      </div>
      
      {isSubmitting && (
        <p className="text-center text-blue-600 mt-4">Publishing event...</p>
      )}
      {submissionError && (
        <p className="text-center text-red-500 mt-4">{submissionError}</p>
      )}

      <div className={commonFormStyles.buttonGroup}>
        <button onClick={prevStep} className={commonFormStyles.prevButton} disabled={isSubmitting}>Previous</button>
        <button onClick={handleSubmit} className={commonFormStyles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish Event'}
        </button>
      </div>
    </div>
  );
};

export default ReviewAndPublishStep;