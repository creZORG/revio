import React from 'react';
import styles from '../EventDetailPage.module.css'; // Use parent's CSS module

// Import sub-components for specific event types
import TicketPurchaseSection from '../../../components/Events/Details/TicketPurchaseSection.jsx';
import RsvpFormSection from '../../../components/Events/Details/RsvpFormSection.jsx';
import OnlineEventInfo from '../../../components/Events/Details/OnlineEventInfo.jsx';
import FreeEventInfo from '../../../components/Events/Details/FreeEventInfo.jsx';
import NightlifeSpecifics from '../../../components/Events/Details/NightlifeSpecifics.jsx';

const EventSidebarActions = ({ event, setMpesaAmount, setShowMpesaModal }) => {
  // Render appropriate event action/details component for the main action section
  const renderEventActionComponent = () => {
    if (!event) return null;

    const isNaksYetuTicketedEvent = event.isNaksYetuTicketed || (event.eventType === 'ticketed' && event.ticketTypes && event.ticketTypes.length > 0);

    const isBasicAdminEvent = !isNaksYetuTicketedEvent && (event.eventType === 'free' || event.eventType === 'rsvp' || event.eventType === 'online');

    if (isNaksYetuTicketedEvent) {
        return <TicketPurchaseSection event={event} onProceedToCheckout={(amount) => {setMpesaAmount(amount); setShowMpesaModal(true);}} />;
    } else if (event.eventType === 'rsvp' && !isBasicAdminEvent) {
        return <RsvpFormSection event={event} />;
    } else if (event.eventType === 'online' && !isBasicAdminEvent) {
        return <OnlineEventInfo event={event} />;
    } else if (event.eventType === 'free' && !isBasicAdminEvent) {
        return <FreeEventInfo event={event} />;
    } else if (event.category === 'Nightlife') {
        return <NightlifeSpecifics event={event} />;
    }
    return (
      <div className={styles.sectionContent} style={{textAlign: 'center', color: 'var(--naks-text-secondary)'}}>
        <h2 className={styles.sidebarHeading}>Event Actions</h2>
        <p>No specific actions available for this event type.</p>
        <p>This event is for visibility only.</p>
      </div>
    );
  };

  return (
    <div className={styles.sidebarColumn}> {/* Right column for PC */}
        {renderEventActionComponent()}
    </div>
  );
};

export default EventSidebarActions;