import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../../../components/Common/Modal.jsx'; // Global Modal component
import TextInput from '../../../../components/Common/TextInput.jsx'; // Global TextInput
import Button from '../../../../components/Common/Button.jsx';     // Global Button
import { FaPlus, FaTimes, FaSpinner } from 'react-icons/fa';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';

const TicketConfigModal = ({ isOpen, onClose, onSaveTickets, initialTicketTypes = [] }) => {
  const { showNotification } = useNotification();
  // Initialize ticketTypes state with a default empty ticket if initialTicketTypes is empty
  const [ticketTypes, setTicketTypes] = useState(initialTicketTypes.length > 0 ? initialTicketTypes : [{ name: '', quantity: '', price: '' }]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Reset form when modal opens with new initial data
    if (isOpen) {
      setTicketTypes(initialTicketTypes.length > 0 ? initialTicketTypes : [{ name: 'Standard', quantity: '', price: '' }]);
      setErrors({}); // Clear errors
      setIsSaving(false); // Reset saving state
    }
  }, [isOpen, initialTicketTypes]);

  const handleTicketChange = useCallback((index, field, value) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index] = { ...newTicketTypes[index], [field]: value };
    setTicketTypes(newTicketTypes);
    // Clear specific error for the changed field, and general error
    setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[`${field}-${index}`];
        delete updatedErrors.general;
        return updatedErrors;
    });
  }, [ticketTypes]);

  const addTicketType = useCallback(() => {
    setTicketTypes(prev => [...prev, { name: '', quantity: '', price: '' }]);
  }, []);

  const removeTicketType = useCallback((indexToRemove) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(prev => prev.filter((_, index) => index !== indexToRemove));
      setErrors(prev => { // Clear errors for removed ticket
        const newErrors = { ...prev };
        // Remove all errors related to the ticket being removed
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith('name-') || key.startsWith('quantity-') || key.startsWith('price-')) {
            const idx = parseInt(key.split('-')[1]);
            if (idx === indexToRemove) delete newErrors[key];
            // If errors for later tickets need to be re-indexed, that's more complex,
            // but for simple validation, just clearing is fine.
          }
        });
        return newErrors;
      });
    } else {
      showNotification('You must have at least one ticket type.', 'info');
    }
  }, [ticketTypes, showNotification]);

  const validateTickets = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    if (ticketTypes.length === 0) {
      newErrors.general = 'At least one ticket type is required.';
      isValid = false;
    }
    ticketTypes.forEach((ticket, index) => {
      if (!ticket.name.trim()) { newErrors[`name-${index}`] = 'Name required.'; isValid = false; }
      const qty = parseInt(ticket.quantity);
      if (isNaN(qty) || qty <= 0) { newErrors[`quantity-${index}`] = 'Positive number required.'; isValid = false; }
      const price = parseFloat(ticket.price);
      if (isNaN(price) || price < 0) { newErrors[`price-${index}`] = 'Non-negative price required.'; isValid = false; }
    });
    setErrors(newErrors);
    return isValid;
  }, [ticketTypes]);

  const handleSave = async () => {
    if (!validateTickets()) {
      showNotification('Please correct errors in ticket details.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      // Pass validated tickets back to parent component (CreateEventTab)
      await onSaveTickets(ticketTypes);
      showNotification('Ticket details saved!', 'success');
      onClose(); // Close the modal on successful save
    } catch (err) {
      console.error("Error saving tickets:", err);
      showNotification('Failed to save ticket details.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Tickets">
      <div className="space-y-4">
        {ticketTypes.map((ticket, index) => (
          <div key={index} className="profile-section-card" style={{padding: '15px'}}> {/* Reusing profile-section-card for consistent card style */}
            <h4 className="text-lg font-semibold text-naks-black mb-3">Ticket Type #{index + 1}</h4>
            {ticketTypes.length > 1 && (
              <button
                type="button"
                onClick={() => removeTicketType(index)}
                className="icon-btn" // Reusing global icon-btn style from index.css
                style={{position: 'absolute', top: '8px', right: '8px', color: 'var(--sys-error)'}}
              >
                <FaTimes />
              </button>
            )}
            <div className="form-group"> {/* Use global form-group style */}
              <label htmlFor={`ticket-name-${index}`} className="form-label">Ticket Name:</label> {/* Use global form-label */}
              <input
                type="text"
                id={`ticket-name-${index}`}
                name="name"
                className="input-field" // Use global input-field style
                placeholder="e.g., Standard Entry"
                required
                value={ticket.name}
                onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
              />
              {errors[`name-${index}`] && <p className="error-message-box">{errors[`name-${index}`]}</p>} {/* Use global error-message-box */}
            </div>
            <div className="form-group">
              <label htmlFor={`ticket-quantity-${index}`} className="form-label">Quantity Available:</label>
              <input
                type="number"
                id={`ticket-quantity-${index}`}
                name="quantity"
                className="input-field"
                placeholder="e.g., 100"
                min="1"
                required
                value={ticket.quantity}
                onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
              />
              {errors[`quantity-${index}`] && <p className="error-message-box">{errors[`quantity-${index}`]}</p>}
            </div>
            <div className="form-group">
              <label htmlFor={`ticket-price-${index}`} className="form-label">Price (KES):</label>
              <input
                type="number"
                id={`ticket-price-${index}`}
                name="price"
                className="input-field"
                placeholder="e.g., 1500"
                min="0"
                step="0.01"
                required
                value={ticket.price}
                onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
              />
              {errors[`price-${index}`] && <p className="error-message-box">{errors[`price-${index}`]}</p>}
            </div>
          </div>
        ))}
        {errors.general && <p className="error-message-box">{errors.general}</p>}
        <Button onClick={addTicketType} className="btn btn-secondary" style={{width: '100%'}}> {/* Use global btn btn-secondary */}
          <FaPlus /> Add Another Ticket Type
        </Button>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={onClose} className="btn btn-secondary">Cancel</Button>
        <Button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
          {isSaving ? <FaSpinner className="spinner mr-2" /> : null}
          {isSaving ? 'Saving...' : 'Save Tickets'}
        </Button>
      </div>
    </Modal>
  );
};

export default TicketConfigModal;