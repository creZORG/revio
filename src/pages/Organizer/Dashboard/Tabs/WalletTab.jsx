import React from 'react';

const WalletTab = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md min-h-[calc(100vh-120px)]">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Wallet & Payouts</h2>
      <p className="text-gray-600 mb-4">
        View your current balance from ticket sales and request payouts to your M-Pesa.
      </p>
      <div className="bg-indigo-100 p-6 rounded-lg shadow-sm text-center">
        <h3 className="font-semibold text-xl text-indigo-800 mb-2">Current Balance</h3>
        <p className="text-4xl font-bold text-indigo-600">Ksh 0.00</p>
        <p className="text-sm text-indigo-700 mt-2">Funds available for withdrawal.</p>
        <button className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300">
          Request Payout
        </button>
      </div>
      {/* Placeholder for payout history */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Payout History</h3>
        <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
          <p>No payout history yet.</p>
        </div>
      </div>
    </div>
  );
};

export default WalletTab;