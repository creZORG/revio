import React from 'react';
import LoadingSkeleton from '../../Common/LoadingSkeleton.jsx'; // Assuming LoadingSkeleton is available
import styles from '../EventDetailPage.module.css'; // Use parent's CSS module

const GallerySection = ({ galleryImages, eventName, loading }) => {
  if (loading) {
    return (
      <section className={styles.sectionContent}>
        <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>Event Gallery</h2>
        <LoadingSkeleton width="100%" height="150px" style={{ marginBottom: '10px' }} />
        <div className={styles.galleryGrid}>
          {Array(4).fill(0).map((_, i) => (
            <LoadingSkeleton key={i} width="100%" height="100px" className={styles.galleryItem} />
          ))}
        </div>
      </section>
    );
  }

  if (!galleryImages || galleryImages.length === 0) {
    return (
      <section className={styles.sectionContent}>
        <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>Event Gallery</h2>
        <p className={styles.textContent} style={{textAlign: 'center', color: 'var(--naks-text-secondary)'}}>
          No gallery images available for this event yet.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.sectionContent}>
      <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>Event Gallery</h2>
      <div className={styles.galleryGrid}>
        {galleryImages.map((imgUrl, index) => (
          <img
            key={index}
            src={imgUrl}
            alt={`${eventName || 'Event'} Gallery Image ${index + 1}`}
            className={styles.galleryItem}
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x150/CCCCCC/000000?text=Image+Error'; }}
          />
        ))}
      </div>
    </section>
  );
};

export default GallerySection;