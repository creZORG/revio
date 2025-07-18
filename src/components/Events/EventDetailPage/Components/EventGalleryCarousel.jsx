// /src/components/Events/EventDetailPage/Components/EventGalleryCarousel.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight,FaSpinner } from 'react-icons/fa';

import styles from './EventGalleryCarousel.module.css'; // Dedicated CSS for gallery carousel
import commonStyles from '../../EventDetailPage.module.css'; // For section content and title

const EventGalleryCarousel = ({ galleryImages, eventName }) => {
    const carouselTrackRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true); // Internal loading for images

    const totalImages = galleryImages ? galleryImages.length : 0;

    const updateCarousel = useCallback(() => {
        if (carouselTrackRef.current && totalImages > 0) {
            const offset = -currentIndex * 100;
            carouselTrackRef.current.style.transform = `translateX(${offset}%)`;

            // Update pagination dots (if using internal dots)
            document.querySelectorAll(`.${styles.carouselPagination} .${styles.paginationDot}`).forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add(styles.active);
                } else {
                    dot.classList.remove(styles.active);
                }
            });
        }
    }, [currentIndex, totalImages]);

    useEffect(() => {
        if (totalImages > 0) {
            // Re-create pagination dots dynamically
            const paginationContainer = document.querySelector(`.${styles.carouselPagination}`);
            if (paginationContainer) {
                paginationContainer.innerHTML = ''; // Clear previous dots
                galleryImages.forEach((_, index) => {
                    const dot = document.createElement('div');
                    dot.classList.add(styles.paginationDot);
                    if (index === 0) dot.classList.add(styles.active);
                    dot.dataset.index = index;
                    dot.addEventListener('click', () => {
                        setCurrentIndex(index);
                    });
                    paginationContainer.appendChild(dot);
                });
            }
            updateCarousel();
        }
        setLoading(false); // Assume loaded if images exist
    }, [galleryImages, updateCarousel, totalImages]);

    useEffect(() => {
        updateCarousel();
    }, [currentIndex, updateCarousel]);


    const handlePrev = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + totalImages) % totalImages);
    }, [totalImages]);

    const handleNext = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % totalImages);
    }, [totalImages]);


    if (loading) {
        return (
            <div className={styles.carouselContainer} style={{height: '150px'}}>
                <div className={styles.loadingOverlay}>
                    <FaSpinner className="fa-spin" style={{fontSize: '2rem', color: 'var(--naks-primary)'}} />
                    <p style={{color: 'var(--naks-text-secondary)', marginTop: '10px'}}>Loading gallery...</p>
                </div>
            </div>
        );
    }

    if (!galleryImages || galleryImages.length === 0) {
        return (
            <p className={styles.noGalleryMessage}>No gallery images available for this event.</p>
        );
    }

    return (
        <section className={`${commonStyles.sectionContent} ${styles.galleryCarouselSection}`}>
            <h2 className={`${commonStyles.sectionTitle} ${styles.gradientText}`}>Event Gallery</h2>
            <div className={styles.carouselContainer}>
                <div ref={carouselTrackRef} className={styles.carouselTrack}>
                    {galleryImages.map((imgUrl, index) => (
                        <img key={index} src={imgUrl} alt={`${eventName} Gallery ${index+1}`} className={styles.carouselImage} />
                    ))}
                </div>

                {totalImages > 1 && ( /* Show arrows only if more than one image */
                    <>
                        <button className={`${styles.carouselArrow} ${styles.leftArrow}`} onClick={handlePrev}>
                            <FaChevronLeft />
                        </button>
                        <button className={`${styles.carouselArrow} ${styles.rightArrow}`} onClick={handleNext}>
                            <FaChevronRight />
                        </button>
                    </>
                )}
                
                {totalImages > 1 && ( /* Show pagination only if more than one image */
                    <div className={styles.carouselPagination}></div>
                )}
            </div>
        </section>
    );
};

export default EventGalleryCarousel;