import React, { useState } from 'react';
import styles from './CreateContentTab.module.css';
import { FaCalendarPlus, FaBullhorn, FaPenSquare } from 'react-icons/fa';

// Import the form components we will create next
import CreateEventPosterForm from '../Forms/CreateEventPosterForm';
import CreateAdForm from '../Forms/CreateAdForm';
import CreateBlogForm from '../Forms/CreateBlogForm';

const CreateContentTab = () => {
  const [activeForm, setActiveForm] = useState('event'); // 'event', 'ad', or 'blog'

  const renderActiveForm = () => {
    switch (activeForm) {
      case 'event':
        return <CreateEventPosterForm />;
      case 'ad':
        return <CreateAdForm />;
      case 'blog':
        return <CreateBlogForm />;
      default:
        return <CreateEventPosterForm />;
    }
  };

  return (
    <div className={styles.createContentContainer}>
      <div className={styles.subNavBar}>
        <button
          onClick={() => setActiveForm('event')}
          className={activeForm === 'event' ? styles.active : ''}
        >
          <FaCalendarPlus /> Create Event Poster
        </button>
        <button
          onClick={() => setActiveForm('ad')}
          className={activeForm === 'ad' ? styles.active : ''}
        >
          <FaBullhorn /> Create Ad
        </button>
        <button
          onClick={() => setActiveForm('blog')}
          className={activeForm === 'blog' ? styles.active : ''}
        >
          <FaPenSquare /> Create Blog Post
        </button>
      </div>
      <div className={styles.formContent}>
        {renderActiveForm()}
      </div>
    </div>
  );
};

export default CreateContentTab;