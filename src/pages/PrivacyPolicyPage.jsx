// src/pages/PrivacyPolicyPage.jsx
import React from 'react';
import PolicyViewer from '../components/Policies/PolicyViewer.jsx';

const privacyPolicyContent = `
# Naks Yetu - Privacy Policy

**Last Updated: July 8, 2025**

Naks Yetu is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

---

## 1. Information We Collect

We collect information that identifies, relates to, describes, or is capable of being associated with you ("Personal Information"). This includes:

* **Account Information:** When you register, we collect your name, email address, password, and contact number.
* **Profile Information:** Optional details like profile picture, social media links, and preferences.
* **Event Data:** Information related to events you create (as an organizer), tickets you purchase, RSVPs, and events you attend.
* **Payment Information:** For ticketed events, we collect payment details (e.g., credit card information, Mpesa details). This is processed securely via third-party payment gateways; we do not store full payment card numbers on our servers.
* **Communication Data:** Records of your communications with us, including support inquiries and feedback.
* **Usage Data:** Information about how you access and use the Service, such as IP address, device type, browser type, pages viewed, time spent, and referral sources.
* **Cookies and Tracking Technologies:** We use cookies and similar technologies to track activity on our Service and hold certain information.

---

## 2. How We Use Your Information

We use the information we collect for various purposes, including:

* **To Provide and Maintain the Service:** To operate, maintain, and improve the functionality of Naks Yetu.
* **Account Management:** To manage your account, including registration, login, and email verification (via ZeptoMail).
* **Event Management:** To facilitate event creation, ticketing, RSVP, and attendance tracking.
* **Personalization:** To tailor your experience, recommend events, and display personalized content.
* **Communication:** To send you transactional emails (e.g., welcome emails, ticket confirmations), service announcements, and marketing communications (if you opt-in).
* **Payments:** To process transactions and manage payouts for organizers.
* **Analytics and Improvement:** To monitor and analyze usage trends, improve the Service, and develop new features.
* **Security:** To detect, prevent, and address technical issues and fraudulent activities.
* **Legal Compliance:** To comply with legal obligations and enforce our Terms of Service.

---

## 3. How We Share Your Information

We may share your information with third parties in the following situations:

* **With Event Organizers:** If you purchase a ticket or RSVP to an event, relevant information (e.g., your name, email, ticket type) may be shared with the event organizer for event management purposes.
* **Service Providers:** We may share your information with third-party vendors and service providers who perform services on our behalf, such as payment processing (e.g., Mpesa, Stripe), email delivery (ZeptoMail), hosting (Firebase Hosting), and analytics (Google Analytics for Firebase).
* **Influencers:** If you use a promo code associated with an influencer, limited, aggregated data (e.g., number of uses) might be shared with the influencer for tracking purposes. Your personal identifying information will not be shared with influencers.
* **Legal Requirements:** We may disclose your information if required to do so by law or in response to valid requests by public authorities.
* **Business Transfers:** In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.
* **With Your Consent:** We may disclose your personal information for any other purpose with your explicit consent.

---

## 4. Data Security

We implement reasonable security measures to protect your Personal Information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or method of electronic storage is 100% secure.

---

## 5. Your Data Protection Rights

Depending on your location, you may have the following rights regarding your Personal Information:

* **Access:** Request a copy of your Personal Information.
* **Rectification:** Request correction of inaccurate or incomplete data.
* **Erasure:** Request deletion of your Personal Information.
* **Restriction:** Request restriction of processing your data.
* **Objection:** Object to the processing of your Personal Information.
* **Data Portability:** Request transfer of your data to another organization.
* **Withdraw Consent:** Withdraw your consent at any time where we relied on your consent to process your Personal Information.

To exercise these rights, please contact us at support@naksyetu.com.

---

## 6. Third-Party Websites

Our Service may contain links to third-party websites not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.

---

## 7. Children's Privacy

Our Service is not intended for use by anyone under the age of 18. We do not knowingly collect Personal Information from children under 18. If we become aware that we have collected Personal Information from a child without verification of parental consent, we take steps to remove that information from our servers.

---

## 8. Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

---

## 9. Contact Us

If you have any questions about this Privacy Policy, please contact us:

**Naks Yetu Support**
Email: support@naksyetu.com
`;

const PrivacyPolicyPage = () => {
  return (
    <PolicyViewer title="Privacy Policy" policyContent={privacyPolicyContent} />
  );
};

export default PrivacyPolicyPage;