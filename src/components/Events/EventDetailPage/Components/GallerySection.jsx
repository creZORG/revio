// /src/components/Events/Details/GallerySection.jsx
import React from 'react';
import LoadingSkeleton from '../../Common/LoadingSkeleton.jsx'; 
import styles from '../../Events/EventDetailPage.module.css'; // Use parent's CSS module

const GallerySection = ({ event, loading }) => { // Receives 'event' prop, 'loading' for skeleton
  // Access galleryImages from event prop. Ensure it's an array.
  const galleryImages = event?.galleryImages || []; 

  // NEW DEBUG LOG
  console.log("GallerySection DEBUG: event prop received:", event);
  console.log("GallerySection DEBUG: galleryImages array derived:", galleryImages);


  if (loading) {
    return (
      <section className={`${styles.sectionContent} ${styles.gallerySection}`}>
        <h2 className={styles.sectionTitle}>Event Gallery</h2>
        <LoadingSkeleton width="100%" height="150px" style={{ marginBottom: '10px' }} />
        <div className={styles.galleryGrid}>
          {Array(4).fill(0).map((_, i) => (
            <LoadingSkeleton key={i} width="100%" height="100px" className={styles.galleryItem} />
          ))}
        </div>
      </section>
    );
  }

  if (galleryImages.length === 0) {
    return (
      <section className={`${styles.sectionContent} ${styles.gallerySection}`}>
        <h2 className={styles.sectionTitle}>Event Gallery</h2>
        <p className={styles.noGalleryMessage}>No gallery images available for this event yet.</p>
      </section>
    );
  }

  return (
    <section className={`${styles.sectionContent} ${styles.gallerySection}`}>
      <h2 className={styles.sectionTitle}>Event Gallery</h2>
      <div className={styles.galleryGrid}>
        {galleryImages.map((imageUrl, index) => (
          <img 
            key={index} 
            src={imageUrl} 
            alt={`${event?.eventName || 'Event'} Gallery Image ${index + 1}`} 
            className={styles.galleryItem} 
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x150/CCCCCC/000000?text=Image+Error'; }} // Fallback for broken images
          />
        ))}
      </div>
    </section>
  );
};

export default GallerySection;