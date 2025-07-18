// /functions/services/emailService.js
// This file will be loaded by functions/index.js
const functions = require("firebase-functions"); // Need functions here for config
const axios = require("axios"); // Need axios for API call

// ZeptoMail Credentials - accessed via functions.config()
// Ensure these are accessed robustly, as they come from Firebase config
const ZEPTOMAIL_API_KEY = functions.config().zeptomail?.api_key || '';
const ZEPTOMAIL_SENDER_NAME = functions.config().zeptomail?.sender_name || '';
const ZEPTOMAIL_SENDER_EMAIL = functions.config().zeptomail?.sender_email || '';

const ZEPTOMAIL_API_URL = "https://api.zeptomail.com/v1.1/email/template"; // ZeptoMail template API endpoint

exports.sendTestEmail = async (toEmail, subject, content) => {
    // Basic validation of ZeptoMail config
    if (!ZEPTOMAIL_API_KEY || !ZEPTOMAIL_SENDER_EMAIL || !ZEPTOMAIL_SENDER_NAME) {
        console.error("ZeptoMail credentials not configured in functions config. Cannot send email.");
        return { success: false, message: "ZeptoMail not configured." };
    }

    try {
        const zeptoMailToken = `Zoho-enczapikey ${ZEPTOMAIL_API_KEY}`; // Correct token format

        const response = await axios.post(ZEPTOMAIL_API_URL, {
            "from": { "address": ZEPTOMAIL_SENDER_EMAIL, "name": ZEPTOMAIL_SENDER_NAME },
            "to": [{ "email_address": { "address": toEmail, "name": toEmail.split('@')[0] } }],
            "subject": subject,
            "htmlbody": `<p>${content}</p>`,
            "textbody": content
        }, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": zeptoMailToken
            },
        });

        if (response.status === 200) {
            console.log("ZeptoMail sent successfully:", response.data);
            return { success: true, message: "Email sent successfully!" };
        } else {
            console.error("ZeptoMail API error:", response.status, response.data);
            return { success: false, message: `ZeptoMail API error: ${response.data.message || response.statusText}` };
        }
    } catch (error) {
        console.error("Error sending email with ZeptoMail:", error.response ? error.response.data : error.message);
        return { success: false, message: `Failed to send email: ${error.response?.data?.message || error.message}` };
    }
};