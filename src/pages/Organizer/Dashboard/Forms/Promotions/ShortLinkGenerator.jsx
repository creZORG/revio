// src/pages/Organizer/Dashboard/Forms/Promotions/ShortLinkGenerator.jsx
import React, { useState, useEffect } from 'react';
import styles from '../../Tabs/CreateEventWizard.module.css'; // Reusing wizard styles for form elements
import { useAuth } from '../../../../../hooks/useAuth.js';
import { useNotification } from '../../../../../contexts/NotificationContext.jsx';
import { getOrganizerEvents } from '../../../../../services/eventApiService.js'; // To fetch events
import TextInput from '../../../../../components/Common/TextInput.jsx';
import Button from '../../../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../../../components/Common/LoadingSkeleton.jsx';

import { LinkIcon, DocumentDuplicateIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Icons

const ShortLinkGenerator = () => {
  const { currentUser, loadingAuth } = useAuth();
  const { showNotification } = useNotification();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [shortLinkData, setShortLinkData] = useState({
    eventId: '',
    customPath: '', // e.g., 'my-event-promo'
    generatedUrl: '', // Will be set after creation
  });
  const [createdShortLinks, setCreatedShortLinks] = useState([]); // To display existing links

  useEffect(() => {
    const fetchOrganizerData = async () => {
      if (!currentUser?.uid) {
        setLoadingEvents(false);
        return;
      }
      setLoadingEvents(true);
      try {
        const fetchedEvents = await getOrganizerEvents(currentUser.uid);
        setEvents(fetchedEvents);
        // TODO: Fetch existing short links for this organizer
        // const fetchedLinks = await shortLinkService.getOrganizerShortLinks(currentUser.uid);
        // setCreatedShortLinks(fetchedLinks);
      } catch (error) {
        console.error("Failed to fetch organizer data for short link generator:", error);
        showNotification("Failed to load data. " + error.message, 'error');
      } finally {
        setLoadingEvents(false);
      }
    };

    if (!loadingAuth) {
      fetchOrganizerData();
    }
  }, [currentUser, loadingAuth, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShortLinkData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateShortLink = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid) {
      showNotification('You must be logged in to create a short link.', 'error');
      return;
    }
    if (!shortLinkData.eventId || !shortLinkData.customPath) {
      showNotification('Please select an event and provide a custom path.', 'error');
      return;
    }

    // Ensure custom path doesn't contain slashes or invalid characters
    const sanitizedPath = shortLinkData.customPath.replace(/[^a-zA-Z0-9-_]/g, '');
    if (sanitizedPath !== shortLinkData.customPath) {
      showNotification('Custom path can only contain letters, numbers, hyphens, and underscores.', 'error');
      setShortLinkData(prev => ({ ...prev, customPath: sanitizedPath }));
      return;
    }

    // Construct the full target URL (e.g., naksyetu.co.ke/events/EVENT_ID)
    const selectedEvent = events.find(event => event.id === shortLinkData.eventId);
    if (!selectedEvent) {
        showNotification('Selected event not found.', 'error');
        return;
    }
    const targetUrl = `https://naksyetu.co.ke/events/${selectedEvent.id}`; // Base URL for event detail page

    console.log('Creating short link with data:', { ...shortLinkData, targetUrl });
    showNotification('Short link creation initiated...', 'info');

    try {
      // TODO: Implement shortLinkService.createShortLink({ ...shortLinkData, targetUrl }, currentUser.uid);
      // This service call would:
      // 1. Check if customPath is available/unique
      // 2. Save short link to Firestore (path, targetUrl, eventId, organizerId, clicks: 0)
      // 3. Potentially interact with a Cloud Function for actual redirect logic

      // Simulate success and a generated URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newGeneratedUrl = `https://naksyetu.co.ke/s/${sanitizedPath}`; // Example short URL
      setShortLinkData(prev => ({ ...prev, generatedUrl: newGeneratedUrl }));
      setCreatedShortLinks(prev => [...prev, {
          id: Math.random().toString(36).substring(2, 15), // Dummy ID
          customPath: sanitizedPath,
          targetUrl: targetUrl,
          shortUrl: newGeneratedUrl,
          clicks: 0,
          createdAt: new Date().toISOString()
      }]);
      showNotification('Short link created successfully!', 'success');
    } catch (error) {
      console.error("Error creating short link:", error);
      showNotification(`Short link creation failed: ${error.message}`, 'error');
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    showNotification('Link copied to clipboard!', 'success');
  };

  // Dummy refresh clicks function
  const handleRefreshClicks = (linkId) => {
    showNotification(`Refreshing clicks for ${linkId}... (Not yet implemented)`, 'info');
    // In a real scenario, this would trigger a backend call to get updated click counts
  };

  if (loadingEvents) {
    return <LoadingSkeleton count={3} />;
  }

  if (events.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800 rounded-md mt-6">
        <p className="font-semibold">You need to create an event first before creating short links.</p>
        <p className="text-sm">Go to the "Create Event" tab to get started.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-xl font-semibold mb-4">Generate Custom Short Link</h3>
      <form onSubmit={handleCreateShortLink}>
        <div className={styles.formGroup}>
          <label htmlFor="eventId" className={styles.formLabel}>Select Event</label>
          <select
            id="eventId"
            name="eventId"
            value={shortLinkData.eventId}
            onChange={handleChange}
            className={styles.formSelect}
            required
          >
            <option value="">Choose an event</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.eventName} ({event.status.replace(/_/g, ' ')})</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="customPath" className={styles.formLabel}>Custom Path</label>
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">naksyetu.co.ke/s/</span>
            <TextInput
              id="customPath"
              name="customPath"
              value={shortLinkData.customPath}
              onChange={handleChange}
              placeholder="e.g., my-event-promo"
              required
              className="flex-grow"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">This will create a link like: `naksyetu.co.ke/s/your-custom-path`</p>
        </div>

        <Button type="submit" primary className="w-full mt-4">Create Short Link</Button>
      </form>

      {shortLinkData.generatedUrl && (
        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-800 rounded-md flex items-center justify-between">
          <span>Short Link Created: <a href={shortLinkData.generatedUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">{shortLinkData.generatedUrl}</a></span>
          <button onClick={() => handleCopyLink(shortLinkData.generatedUrl)} className="ml-4 text-green-700 hover:text-green-900">
            <DocumentDuplicateIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-4 mt-8">Your Created Short Links</h3>
      {createdShortLinks.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800 rounded-md">
          <p className="font-semibold">No short links created yet.</p>
          <p className="text-sm">Generate one above to see it appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {createdShortLinks.map(link => (
            <div key={link.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-gray-600" />
                  <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link.shortUrl}</a>
                </p>
                <p className="text-sm text-gray-600">Target: {link.targetUrl}</p>
                <p className="text-sm text-gray-600">Clicks: <span className="font-bold text-lg">{link.clicks}</span></p>
              </div>
              <button onClick={() => handleRefreshClicks(link.id)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full" title="Refresh Clicks">
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShortLinkGenerator;