// src/components/Events/TicketBookingForm.jsx
import React, { useState } from 'react';
import Button from '../Common/Button.jsx'; // Correct relative path
import TextInput from '../Common/TextInput.jsx'; // Correct relative path

const TicketBookingForm = ({ eventId, ticketTypes }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [error, setError] = useState('');

  // Dummy ticket types if none are provided
  const defaultTicketTypes = [
    { id: 'std', name: 'Standard Ticket', price: 1500, available: 100 },
    { id: 'vip', name: 'VIP Pass', price: 3000, available: 20 },
    { id: 'early', name: 'Early Bird (Ends Soon)', price: 1200, available: 50 },
  ];
  const typesToUse = ticketTypes && ticketTypes.length > 0 ? ticketTypes : defaultTicketTypes;

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(isNaN(value) || value < 1 ? 1 : value);
    setError(''); // Clear error on change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedType) {
      setError('Please select a ticket type.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }

    const selectedTicket = typesToUse.find(type => type.id === selectedType);
    if (!selectedTicket) {
      setError('Selected ticket type is invalid.');
      return;
    }
    if (quantity > selectedTicket.available) {
      setError(`Only ${selectedTicket.available} tickets of this type are available.`);
      return;
    }

    console.log(`Booking ${quantity} of ${selectedTicket.name} (ID: ${selectedType}) for event ${eventId}`);
    // Here, you would initiate the secure payment flow
    alert(`Proceeding to payment for ${quantity} tickets of type ${selectedTicket.name}. (Simulated)`);
    // After successful payment, you'd typically navigate or show a confirmation
  };

  return (
    <form onSubmit={handleSubmit} className="bg-naks-white rounded-lg shadow-md p-6 mt-6 border border-gray-200">
      <h3 className="text-2xl font-bold text-naks-black mb-4">Book Your Tickets</h3>

      {/* Ticket Type Selection */}
      <div className="mb-4">
        <label htmlFor="ticketType" className="block text-gray-700 text-sm font-semibold mb-2">
          Select Ticket Type:
        </label>
        <select
          id="ticketType"
          value={selectedType}
          onChange={(e) => { setSelectedType(e.target.value); setError(''); }}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naks-pink"
          required
        >
          <option value="">Choose a ticket type</option>
          {typesToUse.map(type => (
            <option key={type.id} value={type.id} disabled={type.available <= 0}>
              {type.name} (KSH {type.price.toLocaleString()}) - {type.available > 0 ? `${type.available} available` : 'Sold Out'}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity Input */}
      <TextInput
        label="Quantity:"
        id="quantity"
        name="quantity"
        type="number"
        value={quantity}
        onChange={handleQuantityChange}
        min="1"
        placeholder="1"
        className="mb-4"
        error={error} // Display general error here
      />

      {/* Calculated Total */}
      {selectedType && quantity > 0 && (
        <div className="mb-6 text-lg font-semibold text-naks-black">
          Total: KSH {(typesToUse.find(type => type.id === selectedType)?.price * quantity || 0).toLocaleString()}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-naks-brown text-sm mb-4">{error}</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-naks-pink text-naks-white py-3 px-6 rounded-md font-bold text-lg hover:bg-opacity-90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!selectedType || quantity <= 0 || !!error}
      >
        Proceed to Payment
      </Button>
    </form>
  );
};

export default TicketBookingForm;