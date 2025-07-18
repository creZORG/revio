import React from 'react';
import styles from '../../../Tabs/CreateEventWizard.module.css'; // Common wizard styles
import TextInput from '../../../../../../components/Common/TextInput.jsx';
import Button from '../../../../../../components/Common/Button.jsx';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const TicketSetup = ({ ticketTypes, onTicketTypesChange }) => {
  const handleTicketChange = (index, field, value) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index] = { ...newTicketTypes[index], [field]: value };
    onTicketTypesChange(newTicketTypes);
  };

  const addTicketType = () => {
    onTicketTypesChange([
      ...ticketTypes,
      {
        name: '',
        type: 'paid', // Default to paid
        price: '',
        quantity: '',
        salesStartDate: '',
        salesStartTime: '',
        salesEndDate: '',
        salesEndTime: '',
        description: '',
      },
    ]);
  };

  const removeTicketType = (indexToRemove) => {
    const filteredTicketTypes = ticketTypes.filter((_, index) => index !== indexToRemove);
    onTicketTypesChange(filteredTicketTypes);
  };

  return (
    <div>
      <h4 className="font-semibold text-lg mb-4">Ticket Types</h4>
      {ticketTypes.length === 0 && (
        <p className="text-gray-600 mb-4">No ticket types added yet. Click "Add Ticket Type" to begin.</p>
      )}

      {ticketTypes.map((ticket, index) => (
        <div key={index} className="mb-6 p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-medium text-md">Ticket Type {index + 1}</h5>
            <button onClick={() => removeTicketType(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full">
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`ticketName-${index}`} className={styles.formLabel}>Ticket Name</label>
            <TextInput
              id={`ticketName-${index}`}
              name="name"
              value={ticket.name}
              onChange={(e) => handleTicketChange(index, e.target.name, e.target.value)}
              placeholder="e.g., General Admission, VIP"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`ticketPrice-${index}`} className={styles.formLabel}>Price (KES)</label>
            <TextInput
              id={`ticketPrice-${index}`}
              name="price"
              value={ticket.price}
              onChange={(e) => handleTicketChange(index, e.target.name, e.target.value)}
              type="number"
              placeholder="e.g., 1000"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`ticketQuantity-${index}`} className={styles.formLabel}>Quantity Available</label>
            <TextInput
              id={`ticketQuantity-${index}`}
              name="quantity"
              value={ticket.quantity}
              onChange={(e) => handleTicketChange(index, e.target.name, e.target.value)}
              type="number"
              placeholder="e.g., 500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={styles.formGroup}>
              <label htmlFor={`salesStartDate-${index}`} className={styles.formLabel}>Sales Start Date</label>
              <input
                type="date"
                id={`salesStartDate-${index}`}
                name="salesStartDate"
                value={ticket.salesStartDate}
                onChange={(e) => handleTicketChange(index, e.target.name, e.target.value)}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor={`salesStartTime-${index}`} className={styles.formLabel}>Sales Start Time</label>
              <input
                type="time"
                id={`salesStartTime-${index}`}
                name="salesStartTime"
                value={ticket.salesStartTime}
                onChange={(e) => handleTicketChange(index, e.target.name, e.target.value)}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor={`salesEndDate-${index}`} className={styles.formLabel}>Sales End Date</label>
              <input
                type="date"
                id={`salesEndDate-${index}`}
                name="salesEndDate"
                value={ticket.salesEndDate}
                onChange={(e) => handleTicketChange(index, e.target.name, e.target.value)}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor={`salesEndTime-${index}`} className={styles.formLabel}>Sales End Time</label>
              <input
                type="time"
                id={`salesEndTime-${index}`}
                name="salesEndTime"
                value={ticket.salesEndTime}
                onChange={(e) => handleTicketChange(index, e.target.name, e.target.value)}
                className={styles.formInput}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`ticketDescription-${index}`} className={styles.formLabel}>Description (Optional)</label>
            <TextInput
              id={`ticketDescription-${index}`}
              name="description"
              value={ticket.description}
              onChange={(e) => handleTicketChange(index, e.target.name, e.target.value)}
              isTextarea={true}
              rows={2}
              placeholder="e.g., Includes 2 complimentary drinks"
            />
          </div>
        </div>
      ))}

      <Button onClick={addTicketType} type="button" secondary className="w-full flex items-center justify-center gap-2 mt-4">
        <PlusCircleIcon className="h-5 w-5" /> Add Ticket Type
      </Button>
    </div>
  );
};

export default TicketSetup;