// /src/components/Events/Details/GallerySection.jsx
import React from 'react';
import styles from '../../Events/EventDetailPage.module.css'; // Use parent's main CSS module

const GallerySection = ({ event }) => { // Receives 'event' prop
  const galleryImages = event?.galleryImages || []; // Access galleryImages from event prop

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
            // Optional: Add onClick for a light-box/modal view
            // onClick={() => openImageInLightbox(imageUrl)}
          />
        ))}
      </div>
    </section>
  );
};

export default GallerySection;