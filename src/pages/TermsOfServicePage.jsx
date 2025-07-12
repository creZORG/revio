// src/pages/TermsOfServicePage.jsx
import React from 'react';
import PolicyViewer from '../components/Policies/PolicyViewer.jsx';

const termsOfServiceContent = `
# Naks Yetu - Terms of Service

**Last Updated: July 8, 2025**

Welcome to Naks Yetu! These Terms of Service ("Terms") govern your access to and use of the Naks Yetu website, mobile applications, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use the Service.

---

## 1. Acceptance of Terms

By creating an account, accessing, or using the Naks Yetu Service, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as any additional terms and conditions that are referenced herein or that may apply to specific features of the Service.

---

## 2. Changes to Terms

Naks Yetu reserves the right to modify or update these Terms at any time, at our sole discretion. We will notify you of any material changes by posting the new Terms on the Service and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.

---

## 3. Eligibility

You must be at least 18 years old to use the Naks Yetu Service. By using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.

---

## 4. Account Registration and Security

* **Account Creation:** To access certain features of the Service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
* **Account Confidentiality:** You are solely responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify Naks Yetu immediately of any unauthorized use of your account or any other breach of security.
* **Account Responsibility:** Naks Yetu will not be liable for any loss or damage arising from your failure to comply with this Section.

---

## 5. User Roles and Responsibilities

Naks Yetu supports various user roles, each with specific functionalities and responsibilities:

* **General User:** Can browse events, purchase tickets, RSVP, manage personal dashboards, and access public information.
* **Organizer:** Can create, manage, and promote events; manage ticket sales/RSVPs; and access event-specific analytics. Organizers are responsible for the accuracy of event details, fulfillment of event promises, and adherence to all applicable laws and regulations.
* **Influencer:** Can promote events, manage assigned promo codes, track referral performance, and engage with their audience. Influencers are responsible for ethical promotion and compliance with any marketing regulations.
* **Administrator:** Has full control over user management, event management, promo code management, and platform settings. Administrators are responsible for the overall operation and integrity of the platform.

All users agree to use the Service in a lawful manner and not to engage in any activity that could harm Naks Yetu, its users, or third parties.

---

## 6. Content and Conduct

* **User-Generated Content:** You are solely responsible for any content you post, upload, or transmit through the Service, including event descriptions, images, comments, and profile information. You agree that your content will not violate any third-party rights, be unlawful, defamatory, obscene, or otherwise objectionable.
* **Prohibited Conduct:** You agree not to:
    * Use the Service for any illegal or unauthorized purpose.
    * Impersonate any person or entity.
    * Interfere with or disrupt the integrity or performance of the Service.
    * Attempt to gain unauthorized access to any part of the Service or its related systems or networks.
    * Upload or transmit viruses or any other malicious code.
    * Engage in any activity that could damage, disable, overburden, or impair the Service.

---

## 7. Event Management and Ticketing

* **Event Accuracy:** Organizers are solely responsible for ensuring the accuracy of all event details, including dates, times, locations, pricing, and descriptions.
* **Ticket Sales:** Naks Yetu facilitates ticket sales and RSVP management. All sales are final unless otherwise stated by the event organizer. Naks Yetu is not responsible for event cancellations, postponements, or changes. Refunds, if applicable, are at the discretion of the event organizer and handled according to their stated policies.
* **Promo Codes:** Promo codes are subject to specific terms and conditions set by Naks Yetu or the event organizer.

---

## 8. Intellectual Property

All content on the Naks Yetu Service, including text, graphics, logos, images, software, and the compilation thereof, is the property of Naks Yetu or its content suppliers and protected by copyright and other intellectual property laws. You may not use any content from the Service without our express written permission.

---

## 9. Disclaimers and Limitation of Liability

* **"As Is" Basis:** The Naks Yetu Service is provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied.
* **No Guarantee:** Naks Yetu does not guarantee that the Service will be uninterrupted, error-free, secure, or free from viruses or other harmful components.
* **Limitation of Liability:** To the fullest extent permitted by applicable law, Naks Yetu shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Service; (b) any conduct or content of any third party on the Service; (c) any content obtained from the Service; and (d) unauthorized access, use, or alteration of your transmissions or content.

---

## 10. Indemnification

You agree to indemnify, defend, and hold harmless Naks Yetu, its affiliates, officers, directors, employees, agents, and licensors from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your infringement of any intellectual property or other right of any person or entity.

---

## 11. Governing Law and Jurisdiction

These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law principles. You agree to submit to the exclusive jurisdiction of the courts located in Nairobi, Kenya to resolve any dispute arising out of these Terms or the Service.

---

## 12. Miscellaneous

* **Entire Agreement:** These Terms constitute the entire agreement between you and Naks Yetu regarding the Service.
* **Severability:** If any provision of these Terms is found to be invalid or unenforceable, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions of these Terms will remain in full force and effect.
* **Waiver:** No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term, and Naks Yetu's failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.

---

## 13. Contact Information

If you have any questions about these Terms, please contact us at:

**Naks Yetu Support**
Email: support@naksyetu.com
`;

const TermsOfServicePage = () => {
  return (
    <PolicyViewer title="Terms of Service" policyContent={termsOfServiceContent} />
  );
};

export default TermsOfServicePage;