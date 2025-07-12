import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../utils/firebaseConfig.js';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth.js';
import { useNotification } from '../contexts/NotificationContext.jsx';
import LoadingSkeleton from '../components/Common/LoadingSkeleton.jsx';
import Modal from '../components/Common/Modal.jsx';
import Button from '../components/Common/Button.jsx';

import styles from './BlogPage.module.css'; // Dedicated CSS for BlogPage

import { FaRegEdit, FaTrashAlt, FaArchive, FaEye, FaCalendarAlt, FaUserCircle, FaInfoCircle, FaSpinner } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

// Universal Date Conversion Helper (for blog posts)
const toJSDate = (firestoreTimestampOrDateValue) => {
  if (!firestoreTimestampOrDateValue) return null;
  if (firestoreTimestampOrDateValue instanceof Date) return firestoreTimestampOrDateValue;
  if (typeof firestoreTimestampOrDateValue.toDate === 'function') {
    return firestoreTimestampOrDateValue.toDate();
  }
  if (typeof firestoreTimestampOrDateValue === 'object' && firestoreTimestampOrDateValue.seconds !== undefined && firestoreTimestampOrDateValue.nanoseconds !== undefined) {
    return new Date(firestoreTimestampOrDateValue.seconds * 1000 + firestoreTimestampOrDateValue.nanoseconds / 1000000);
  }
  if (typeof firestoreTimestampOrDateValue === 'string' || typeof firestoreTimestampOrDateValue === 'number') {
    const date = new Date(firestoreTimestampOrDateValue);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

const BlogPage = () => {
  const { currentUser, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();

  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPostToEdit, setCurrentPostToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', disclaimer: '', targetAudience: 'everyone', archiveDate: '' });
  const [editErrors, setEditErrors] = useState({});
  const [isSavingPost, setIsSavingPost] = useState(false);

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const postsRef = collection(db, `artifacts/${appId}/public/blogPosts`);
        let q = query(postsRef, orderBy('createdAt', 'desc'));

        // Filter for non-admin users
        if (userRole !== 'admin') {
          q = query(q, where('status', '==', 'published')); // Only published posts for public
          // Filter by target audience
          q = query(q, where('targetAudience', 'in', ['everyone', userRole || 'user'])); // 'user' for unauthenticated/general users
        }

        const snapshot = await getDocs(q);
        const fetchedPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: toJSDate(doc.data().createdAt),
          archiveDate: toJSDate(doc.data().archiveDate),
        }));

        // Client-side filter for archive date
        const filteredByArchive = fetchedPosts.filter(post => {
          if (post.archiveDate && post.archiveDate < new Date()) {
            return false; // Don't show if past archive date
          }
          return true;
        });

        setBlogPosts(filteredByArchive);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setError("Failed to load blog posts.");
        showNotification("Failed to load blog posts.", 'error');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) { // Fetch once auth state is known
      fetchBlogPosts();
    }
  }, [authLoading, userRole, showNotification]);

  const handleEditPost = (post) => {
    setCurrentPostToEdit(post);
    setEditForm({
      title: post.title,
      content: post.content,
      disclaimer: post.disclaimer || '',
      targetAudience: post.targetAudience || 'everyone',
      archiveDate: post.archiveDate ? post.archiveDate.toISOString().split('T')[0] : '', // Format for date input
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleDeletePost = async (postId) => {
    if (!isAuthenticated || userRole !== 'admin') {
      showNotification('You do not have permission to delete posts.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    setIsSavingPost(true);
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/public/blogPosts`, postId));
      setBlogPosts(prev => prev.filter(post => post.id !== postId));
      showNotification('Blog post deleted successfully!', 'success');
    } catch (err) {
      console.error("Error deleting post:", err);
      showNotification('Failed to delete post.', 'error');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleArchivePost = async (postId, currentStatus) => {
    if (!isAuthenticated || userRole !== 'admin') {
      showNotification('You do not have permission to archive posts.', 'error');
      return;
    }
    const newStatus = currentStatus === 'archived' ? 'published' : 'archived';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'archived' ? 'archive' : 'unarchive'} this blog post?`)) {
      return;
    }

    setIsSavingPost(true);
    try {
      await updateDoc(doc(db, `artifacts/${appId}/public/blogPosts`, postId), {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
      setBlogPosts(prev => prev.map(post => post.id === postId ? { ...post, status: newStatus } : post));
      showNotification(`Blog post ${newStatus} successfully!`, 'success');
    } catch (err) {
      console.error("Error archiving post:", err);
      showNotification('Failed to archive post.', 'error');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || userRole !== 'admin') {
      showNotification('You do not have permission to save posts.', 'error');
      return;
    }

    const errors = {};
    if (!editForm.title.trim()) errors.title = 'Title is required.';
    if (!editForm.content.trim()) errors.content = 'Content is required.';
    if (editForm.archiveDate && new Date(editForm.archiveDate) < new Date()) errors.archiveDate = 'Archive date cannot be in the past.';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      showNotification('Please correct the errors in the form.', 'error');
      return;
    }

    setIsSavingPost(true);
    try {
      const postData = {
        title: editForm.title,
        content: editForm.content,
        disclaimer: editForm.disclaimer,
        targetAudience: editForm.targetAudience,
        archiveDate: editForm.archiveDate ? Timestamp.fromDate(new Date(editForm.archiveDate)) : null,
        updatedAt: Timestamp.now(),
        // status and authorId are handled separately or on creation
      };

      if (currentPostToEdit?.id) { // Editing existing post
        await updateDoc(doc(db, `artifacts/${appId}/public/blogPosts`, currentPostToEdit.id), postData);
        setBlogPosts(prev => prev.map(post => post.id === currentPostToEdit.id ? { ...post, ...postData } : post));
        showNotification('Blog post updated successfully!', 'success');
      } else { // Creating new post
        await addDoc(collection(db, `artifacts/${appId}/public/blogPosts`), {
          ...postData,
          authorId: currentUser.uid,
          authorName: currentUser.displayName || currentUser.email.split('@')[0],
          createdAt: Timestamp.now(),
          status: 'published', // Default new posts to published
        });
        showNotification('New blog post created successfully!', 'success');
      }
      setShowEditModal(false);
      setCurrentPostToEdit(null); // Clear current post
      // Re-fetch posts to ensure list is updated (or update state more precisely)
      // This will be handled by the useEffect for blogPosts
    } catch (err) {
      console.error("Error saving post:", err);
      showNotification('Failed to save post. ' + err.message, 'error');
    } finally {
      setIsSavingPost(false);
    }
  };


  if (loading) {
    return (
      <div className={styles.blogPageContainer}>
        <LoadingSkeleton width="100%" height="200px" className="mb-4" />
        <LoadingSkeleton width="100%" height="150px" className="mb-4" />
        <LoadingSkeleton width="100%" height="100px" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message-box">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.blogPageContainer}>
      <h1 className={styles.pageTitle}>Naks Yetu Blog</h1>

      {/* Admin Controls (Create New Post) */}
      {isAuthenticated && userRole === 'admin' && (
        <div className={styles.adminControls}>
          <Button onClick={() => { setCurrentPostToEdit(null); setEditForm({ title: '', content: '', disclaimer: '', targetAudience: 'everyone', archiveDate: '' }); setShowEditModal(true); }} className="btn btn-primary">
            <FaPlus /> Create New Blog Post
          </Button>
        </div>
      )}

      {blogPosts.length === 0 ? (
        <div className="profile-section-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-naks-text-secondary">No blog posts available yet.</p>
          {isAuthenticated && userRole === 'admin' && (
            <p className="text-naks-text-secondary mt-2">Click "Create New Blog Post" to add content.</p>
          )}
        </div>
      ) : (
        <div className={styles.blogPostsGrid}>
          {blogPosts.map(post => (
            <div key={post.id} className={styles.blogCard}>
              <div className={styles.blogCardHeader}>
                <h2 className={styles.blogCardTitle}>{post.title}</h2>
                {isAuthenticated && userRole === 'admin' && (
                  <div className={styles.blogCardAdminActions}>
                    <button onClick={() => handleEditPost(post)} className={styles.adminActionButton}><FaRegEdit /></button>
                    <button onClick={() => handleDeletePost(post.id)} className={styles.adminActionButton}><FaTrashAlt /></button>
                    <button onClick={() => handleArchivePost(post.id, post.status)} className={styles.adminActionButton}>
                      <FaArchive /> {post.status === 'archived' ? 'Unarchive' : 'Archive'}
                    </button>
                  </div>
                )}
              </div>
              <p className={styles.blogCardMeta}>
                <FaUserCircle /> {post.authorName || 'Naks Yetu Team'}
                <FaCalendarAlt style={{marginLeft: '15px'}} /> {post.createdAt?.toLocaleDateString() || 'N/A'}
                {post.archiveDate && <span style={{marginLeft: '15px', color: 'var(--naks-warning)'}}><FaArchive /> Archives: {post.archiveDate.toLocaleDateString()}</span>}
              </p>
              {post.disclaimer && <p className={styles.blogCardDisclaimer}><FaInfoCircle /> {post.disclaimer}</p>}
              {post.targetAudience && <p className={styles.blogCardTarget}>Intended for: {post.targetAudience.toUpperCase()}</p>}
              
              <div className={styles.blogCardContent}>
                {post.content.split('\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('### ')) {
                    return <h4 key={idx} className={styles.blogContentHeading}>{paragraph.substring(4)}</h4>;
                  } else if (paragraph.startsWith('// ')) {
                    return <p key={idx} className={styles.blogContentNote}>{paragraph.substring(3)}</p>;
                  } else {
                    return <p key={idx}>{paragraph}</p>;
                  }
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Post Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={currentPostToEdit ? 'Edit Blog Post' : 'Create New Blog Post'}>
        <form onSubmit={handleSavePost} className={styles.blogEditForm}>
          <div className="form-group">
            <label htmlFor="postTitle" className="form-label">Title <span className="required-star">*</span></label>
            <input type="text" id="postTitle" name="title" className="input-field" value={editForm.title} onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))} disabled={isSavingPost} />
            {editErrors.title && <p className="error-message-box">{editErrors.title}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="postContent" className="form-label">Content <span className="required-star">*</span></label>
            <textarea id="postContent" name="content" className="input-field" rows="10" value={editForm.content} onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))} disabled={isSavingPost} placeholder="Use '### ' for headings and '// ' for italic notes."></textarea>
            {editErrors.content && <p className="error-message-box">{editErrors.content}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="postDisclaimer" className="form-label">Disclaimer (Optional)</label>
            <input type="text" id="postDisclaimer" name="disclaimer" className="input-field" value={editForm.disclaimer} onChange={(e) => setEditForm(prev => ({ ...prev, disclaimer: e.target.value }))} disabled={isSavingPost} placeholder="e.g., This post contains sponsored content." />
          </div>
          <div className="form-group">
            <label htmlFor="targetAudience" className="form-label">Target Audience <span className="required-star">*</span></label>
            <select id="targetAudience" name="targetAudience" className="input-field" value={editForm.targetAudience} onChange={(e) => setEditForm(prev => ({ ...prev, targetAudience: e.target.value }))} disabled={isSavingPost}>
              <option value="everyone">Everyone</option>
              <option value="user">Users</option>
              <option value="organizer">Organizers</option>
              <option value="influencer">Influencers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="archiveDate" className="form-label">Auto-Archive Date (Optional)</label>
            <input type="date" id="archiveDate" name="archiveDate" className="input-field" value={editForm.archiveDate} onChange={(e) => setEditForm(prev => ({ ...prev, archiveDate: e.target.value }))} disabled={isSavingPost} />
            {editErrors.archiveDate && <p className="error-message-box">{editErrors.archiveDate}</p>}
          </div>
          <div className={styles.modalActions}>
            <Button onClick={() => setShowEditModal(false)} className="btn btn-secondary" disabled={isSavingPost}>Cancel</Button>
            <Button type="submit" className="btn btn-primary" disabled={isSavingPost}>
              {isSavingPost ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
              {isSavingPost ? 'Saving...' : 'Save Post'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BlogPage;