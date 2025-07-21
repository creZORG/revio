// src/components/Checkout/TicketDisplayCard.jsx
import React, { useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import styles from './TicketDisplayCard.module.css';
import commonButtonStyles from './../Common/Button.module.css';
import { FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa'; // CORRECTED: Import Fa icons from react-icons/fa

const TicketDisplayCard = ({ ticket, eventDetails }) => {
    const { showNotification } = useNotification();
    const ticketCardRef = useRef(null);

    const SUPPORT_EMAIL = "support@naksyetu.co.ke";
    const SUPPORT_PHONE = "+254 795 505007";
    const INSTAGRAM_HANDLE = "@naksyetu";
    const X_HANDLE = "@naksyetu";
    const TIKTOK_HANDLE = "@naksyetu_";

    const maskEmail = (email) => {
        if (!email) return 'N/A';
        const [name, domain] = email.split('@');
        if (name.length <= 2) return `${name.substring(0, 1)}***@${domain}`;
        return `${name.substring(0, 2)}***@${domain}`;
    };

    const handlePrintTicket = useCallback(() => {
        if (!ticketCardRef.current) {
            showNotification('Ticket content not ready for printing.', 'error');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Your Naks Yetu Ticket</title>');
        printWindow.document.write(`
            <style>
                body { font-family: 'Inter', sans-serif; margin: 20px; color: #333; }
                .ticket-print-container {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 20px;
                    max-width: 600px;
                    margin: 20px auto;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    box-sizing: border-box;
                }
                .ticket-header { text-align: center; color: #FF4500; margin-bottom: 15px; }
                .ticket-info-section { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; margin-bottom: 20px; }
                .ticket-info-item { flex: 1; min-width: 45%; }
                .ticket-info-item p { margin: 5px 0; font-size: 14px; }
                .ticket-info-item strong { color: #555; }
                .qr-code-section { text-align: center; margin: 20px 0; }
                .qr-code-section img { width: 180px; height: 180px; display: block; margin: 0 auto; border: 1px solid #eee; padding: 5px; }
                .qr-code-section p { font-size: 12px; color: #888; margin-top: 10px; }
                .warning-text { font-size: 12px; color: #D32F2F; text-align: center; margin-top: 20px; font-style: italic; }
                .support-info { font-size: 12px; text-align: center; margin-top: 20px; color: #555; }
                .social-links { display: flex; justify-content: center; gap: 10px; margin-top: 10px; }
                .social-link { color: #FF4500; font-size: 20px; }
                @media print {
                    button { display: none !important; }
                }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(`
            <div class="ticket-print-container">
                <h2 class="ticket-header">${eventDetails?.eventName || 'Event Ticket'}</h2>
                <hr>
                <div class="ticket-info-section">
                    <div class="ticket-info-item">
                        <p><strong>Ticket Type:</strong> ${ticket.ticketTypeName || 'N/A'}</p>
                        <p><strong>Ticket ID:</strong> ${ticket.ticketId || 'N/A'}</p>
                        <p><strong>Date:</strong> ${eventDetails?.startDate && format(new Date(eventDetails.startDate), 'PPP') || 'N/A'}</p>
                        <p><strong>Time:</strong> ${eventDetails?.startTime || 'N/A'}</p>
                        <p><strong>Location:</strong> ${eventDetails?.mainLocation || 'N/A'}</p>
                    </div>
                </div>
                <div class="qr-code-section">
                    <img src="${ticket.qrCodeBase64}" alt="QR Code">
                    <p>Scan this QR code for entry</p>
                </div>
                <p class="warning-text">Warning: Scanning this QR code with Naks Yetu systems invalidates it. Ticket can only be used once.</p>
                <div class="support-info">
                    <p>For support, contact us:</p>
                    <p>Email: <span class="support-email">${SUPPORT_EMAIL}</span></p>
                    <p>Phone: <span class="support-phone">${SUPPORT_PHONE}</span></p>
                </div>
                <div class="social-links">
                    <a href="https://www.instagram.com/${INSTAGRAM_HANDLE.substring(1)}" target="_blank" rel="noopener noreferrer" class="social-link"><FaInstagram /></a>
                    <a href="https://twitter.com/${X_HANDLE.substring(1)}" target="_blank" rel="noopener noreferrer" class="social-link"><FaTwitter /></a>
                    <a href="https://www.tiktok.com/${TIKTOK_HANDLE.substring(1)}" target="_blank" rel="noopener noreferrer" class="social-link"><FaTiktok /></a>
                </div>
            </div>
        `);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }, [ticket, eventDetails, SUPPORT_EMAIL, SUPPORT_PHONE, INSTAGRAM_HANDLE, X_HANDLE, TIKTOK_HANDLE, showNotification]);


    const handleDownloadTicket = useCallback(() => {
        if (ticket.qrCodeBase64) {
            const link = document.createElement('a');
            link.href = ticket.qrCodeBase64;
            const filename = `${eventDetails?.eventName.replace(/\s/g, '_')}_${ticket.ticketTypeName || 'Ticket'}_${ticket.ticketId || 'QR'}.svg`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification('QR Code downloaded!', 'success');
        } else {
            showNotification('QR Code not available for download.', 'error');
        }
    }, [ticket, eventDetails, showNotification]);

    return (
        <div className={`${styles.ticketCard} ${!eventDetails?.bannerImageUrl ? styles.noBanner : ''}`}>
            {eventDetails?.bannerImageUrl && (
                <img src={eventDetails.bannerImageUrl} alt="Event Banner" className={styles.ticketBanner} />
            )}
            <div className={styles.ticketContent}>
                <h4 className={styles.ticketName}>{ticket.ticketTypeName || 'Ticket'}</h4>
                <p className={styles.eventName}>{eventDetails?.eventName || 'N/A'}</p>

                <div className={styles.qrCodeContainer}>
                    {ticket.qrCodeBase64 ? (
                        <img src={ticket.qrCodeBase64} alt="QR Code" className={styles.qrCodeImage} />
                    ) : (
                        <p className="text-red-500">QR Not Available</p>
                    )}
                </div>

                <div className={styles.ticketDetailsList}>
                    <p><strong>Ticket ID:</strong> <span className={styles.ticketIdText}>{ticket.ticketId || 'N/A'}</span></p>
                    <p><strong>Date:</strong> {eventDetails?.startDate && format(new Date(eventDetails.startDate), 'PPP') || 'N/A'}</p>
                    <p><strong>Time:</strong> {eventDetails?.startTime || 'N/A'}</p>
                    <p><strong>Location:</strong> {eventDetails?.mainLocation || 'N/A'}</p>
                </div>

                <p className={styles.warningText}>
                    Warning: Scanning this QR code with Naks Yetu systems invalidates it. Ticket can only be used once.
                </p>

                <div className={styles.supportInfo}>
                    <p>For support, contact us:</p>
                    <p>Email: <span className={styles.supportEmail}>{maskEmail(SUPPORT_EMAIL)}</span></p>
                    <p>Phone: <span className={styles.supportPhone}>{SUPPORT_PHONE}</span></p>
                </div>

                <div className={styles.socialIconsContainer}>
                    <a href={`https://www.instagram.com/${INSTAGRAM_HANDLE.substring(1)}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Follow us on Instagram"><FaInstagram /></a>
                    <a href={`https://twitter.com/${X_HANDLE.substring(1)}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Follow us on X (Twitter)"><FaTwitter /></a>
                    <a href={`https://www.tiktok.com/${TIKTOK_HANDLE.substring(1)}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Follow us on TikTok"><FaTiktok /></a>
                </div>

                <div className={styles.ticketActionButtons}>
                    <button
                        type="button"
                        onClick={handlePrintTicket}
                        className={`${styles.ticketActionButton} ${styles.print}`}
                    >
                        Print Ticket
                    </button>
                    <button
                        type="button"
                        onClick={handleDownloadTicket}
                        className={`${styles.ticketActionButton} ${styles.download}`}
                    >
                        Download Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketDisplayCard;