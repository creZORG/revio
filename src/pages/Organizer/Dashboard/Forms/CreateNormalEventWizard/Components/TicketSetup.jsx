import React, { useCallback } from 'react';
import TextInput from '../../../../../../components/Common/TextInput.jsx';
import Button from '../../../../../../components/Common/Button.jsx';
import { FaPlus, FaTimes, FaSpinner } from 'react-icons/fa';

import styles from '../NaksYetuEventLaunchpad.module.css'; // Wizard specific styles

const TicketSetup = ({ ticketTypes, onSaveTickets, formErrors, isSubmitting }) => {
  const handleTicketChange = useCallback((index, field, value) => {
    const newTicketTypes = ticketTypes.map((ticket, i) => {
      if (i === index) {
        // FIX: Ensure date/time fields are stored as strings, to be converted to Timestamp at final submission
        // For booking dates, we store them as strings in formData.
        // The conversion to Timestamp happens in CreateNormalEventWizard.jsx handleSubmit.
        return { ...ticket, [field]: value };
      }
      return ticket;
    });
    onSaveTickets(newTicketTypes);
  }, [ticketTypes, onSaveTickets]);

  const addTicketType = useCallback(() => {
    const newTicket = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
      price: '',
      bookingStartDate: '', // Stored as string
      bookingStartTime: '', // Stored as string
      bookingEndDate: '',   // Stored as string
      bookingEndTime: ''    // Stored as string
    };
    onSaveTickets([...ticketTypes, newTicket]);
  }, [ticketTypes, onSaveTickets]);

  const removeTicketType = useCallback((indexToRemove) => {
    if (ticketTypes.length > 1) {
      onSaveTickets(ticketTypes.filter((_, index) => index !== indexToRemove));
    } else if (ticketTypes.length === 1) {
        onSaveTickets([{ id: Date.now().toString(), name: '', quantity: '', price: '', bookingStartDate: '', bookingStartTime: '', bookingEndDate: '', bookingEndTime: '' }]);
    }
  }, [ticketTypes, onSaveTickets]);

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionHeading}>Ticket Types <span className="optional-label">(at least one required)</span></h3>
      <div id="ticket-types-container">
        {ticketTypes.map((ticket, index) => (
          <div key={ticket.id || index} className={styles.ticketTypeItem}>
            {ticketTypes.length > 1 && (
              <button type="button" onClick={() => removeTicketType(index)} className={styles.removeBtn} disabled={isSubmitting}>
                <FaTimes />
              </button>
            )}
            <div className="form-group">
              <label htmlFor={`ticketName-${index}`} className={styles.formLabel}>Ticket Name <span className="required-star">*</span></label>
              <input type="text" id={`ticketName-${index}`} name="name" className={styles.inputField} value={ticket.name} required placeholder="e.g., Standard Entry" onChange={(e) => handleTicketChange(index, 'name', e.target.value)} disabled={isSubmitting} />
              {formErrors[`ticketTypes.${index}.name`] && <p className="error-message-box">{formErrors[`ticketTypes.${index}.name`]}</p>}
            </div>
            <div className={`${styles.formGroup} ${styles.grid2}`}>
              <div>
                <label htmlFor={`ticketQuantity-${index}`} className={styles.formLabel}>Quantity <span className="optional-label">(Optional)</span></label>
                <input type="number" id={`ticketQuantity-${index}`} name="quantity" className={styles.inputField} value={ticket.quantity} min="0" placeholder="e.g., 100" onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)} disabled={isSubmitting} />
                {formErrors[`ticketTypes.${index}.quantity`] && <p className="error-message-box">{formErrors[`ticketTypes.${index}.quantity`]}</p>}
              </div>
              <div>
                <label htmlFor={`ticketPrice-${index}`} className={styles.formLabel}>Price (KES) <span className="required-star">*</span></label>
                <input type="number" id={`ticketPrice-${index}`} name="price" className={styles.inputField} value={ticket.price} min="0" step="0.01" required placeholder="e.g., 1500" onChange={(e) => handleTicketChange(index, 'price', e.target.value)} disabled={isSubmitting} />
                {formErrors[`ticketTypes.${index}.price`] && <p className="error-message-box">{formErrors[`ticketTypes.${index}.price`]}</p>}
              </div>
            </div>
            <div className={`${styles.formGroup} ${styles.grid2}`}>
                <div>
                    <label htmlFor={`bookingStartDate-${index}`} className={styles.formLabel}>Booking Start Date <span className="optional-label">(Optional)</span></label>
                    <input type="date" id={`bookingStartDate-${index}`} name="bookingStartDate" className={styles.inputField} value={ticket.bookingStartDate || ''} onChange={(e) => handleTicketChange(index, 'bookingStartDate', e.target.value)} disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor={`bookingStartTime-${index}`} className={styles.formLabel}>Booking Start Time <span className="optional-label">(Optional)</span></label>
                    <input type="time" id={`bookingStartTime-${index}`} name="bookingStartTime" className={styles.inputField} value={ticket.bookingStartTime || ''} onChange={(e) => handleTicketChange(index, 'bookingStartTime', e.target.value)} disabled={isSubmitting} />
                </div>
            </div>
            <div className={`${styles.formGroup} ${styles.grid2}`}>
                <div>
                    <label htmlFor={`bookingEndDate-${index}`} className={styles.formLabel}>Booking End Date <span className="optional-label">(Optional)</span></label>
                    <input type="date" id={`bookingEndDate-${index}`} name="bookingEndDate" className={styles.inputField} value={ticket.bookingEndDate || ''} onChange={(e) => handleTicketChange(index, 'bookingEndDate', e.target.value)} disabled={isSubmitting} />
                </div>
                <div>
                    <label htmlFor={`bookingEndTime-${index}`} className={styles.formLabel}>Booking End Time <span className="optional-label">(Optional)</span></label>
                    <input type="time" id={`bookingEndTime-${index}`} name="bookingEndTime" className={styles.inputField} value={ticket.bookingEndTime || ''} onChange={(e) => handleTicketChange(index, 'bookingEndTime', e.target.value)} disabled={isSubmitting} />
                </div>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={addTicketType} className="btn btn-secondary" style={{width: '100%'}} disabled={isSubmitting}>
        <FaPlus /> Add Another Ticket Type
      </Button>
      {formErrors.ticketTypes && <p className="error-message-box">{formErrors.ticketTypes}</p>}
    </div>
  );
};

export default TicketSetup;