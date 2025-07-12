// src/pages/RefundPolicyPage.jsx
import React from 'react';
import PolicyViewer from '../components/Policies/PolicyViewer.jsx';

const refundPolicyContent = `
# Naks Yetu - Standard Refund Policy

**Last Updated: July 8, 2025**

This is Naks Yetu's standard refund policy. Event organizers may choose to adopt this policy or define their own.

---

## 1. General Refund Conditions

* Refunds are generally issued for event cancellations or significant changes (e.g., date, venue) by the organizer.
* Requests for refunds must be made within [X] days of the event cancellation/change notification.
* Processing fees (if any) may be non-refundable.

---

## 2. Event Cancellation by Organizer

If an event is cancelled by the organizer, attendees will receive a full refund of the ticket price, excluding any non-refundable processing fees.

---

## 3. Event Postponement or Significant Change

If an event is postponed or undergoes a significant change (e.g., change of date, venue, or headliner), attendees will be offered the option to:
* Attend the rescheduled event.
* Request a full refund of the ticket price, excluding any non-refundable processing fees.

---

## 4. Attendee Cancellation

Unless explicitly stated otherwise by the event organizer, tickets are generally non-refundable if the attendee cancels or fails to attend.

---

## 5. Refund Process

* Refunds will be processed to the original payment method used for the purchase.
* Please allow [Y] business days for the refund to appear on your statement.

---

## 6. Contact

For any refund-related inquiries, please contact the event organizer directly using the contact information provided on the event page. For issues related to the Naks Yetu platform's refund processing, contact support@naksyetu.com.
`;

const RefundPolicyPage = () => {
  return (
    <PolicyViewer title="Naks Yetu Standard Refund Policy" policyContent={refundPolicyContent} />
  );
};

export default RefundPolicyPage;