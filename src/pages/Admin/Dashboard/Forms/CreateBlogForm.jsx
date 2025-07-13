import React, { useState } from 'react';
import styles from './AdminForms.module.css';
import { useNotification } from '../../../../contexts/NotificationContext';
import { useAuth } from '../../../../hooks/useAuth';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../../utils/firebaseConfig';
import RichTextEditor from '../../../../components/Common/RichTextEditor'; // Assuming this component exists

const CreateBlogForm = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState(['users']);
    const [disclaimer, setDisclaimer] = useState('');
    const [shortNote, setShortNote] = useState('');
    const [tldr, setTldr] = useState('');
    const [archiveDate, setArchiveDate] = useState('');
    const [author, setAuthor] = useState('Naks Yetu Team');

    const handleAudienceChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setAudience(prev => [...prev, value]);
        } else {
            setAudience(prev => prev.filter(aud => aud !== value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || audience.length === 0) {
            showNotification('Title, Content, and Audience are required.', 'error');
            return;
        }
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'articles'), {
                title,
                content,
                audience,
                disclaimer,
                shortNote,
                tldr,
                authorName: author,
                status: 'published',
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid,
                archiveAt: archiveDate ? Timestamp.fromDate(new Date(archiveDate)) : null
            });
            showNotification('Blog post published successfully!', 'success');
            // Reset form if needed
        } catch (error) {
            console.error("Error publishing blog post:", error);
            showNotification('Failed to publish post.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h3 className={styles.formTitle}>Create New Blog Post</h3>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label>Blog Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="A Catchy Title" />
                </div>
                <div className={styles.formGroup}>
                    <label>Author</label>
                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g., Mark, Naks Yetu Team" />
                </div>
            </div>
            <div className={styles.formGroup}>
                <label>Blog Content</label>
                <RichTextEditor value={content} onChange={setContent} />
            </div>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label>TL;DR (Too Long; Didn't Read)</label>
                    <textarea value={tldr} onChange={e => setTldr(e.target.value)} placeholder="A one-sentence summary." rows={2}></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Short Note (Optional, in italics)</label>
                    <textarea value={shortNote} onChange={e => setShortNote(e.target.value)} placeholder="e.g., This is a sponsored post." rows={2}></textarea>
                </div>
            </div>
             <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label>Disclaimer (Optional)</label>
                    <input type="text" value={disclaimer} onChange={e => setDisclaimer(e.target.value)} placeholder="e.g., Views are my own." />
                </div>
                <div className={styles.formGroup}>
                    <label>Auto-archive on (Optional)</label>
                    <input type="date" value={archiveDate} onChange={e => setArchiveDate(e.target.value)} />
                </div>
            </div>
             <div className={styles.formGroup}>
                <label>Audience (Who will see this?)</label>
                <div className={styles.checkboxGroup}>
                    <label><input type="checkbox" value="users" checked={audience.includes('users')} onChange={handleAudienceChange} /> General Users</label>
                    <label><input type="checkbox" value="organizers" checked={audience.includes('organizers')} onChange={handleAudienceChange} /> Organizers</label>
                    <label><input type="checkbox" value="influencers" checked={audience.includes('influencers')} onChange={handleAudienceChange} /> Influencers</label>
                    <label><input type="checkbox" value="admins" checked={audience.includes('admins')} onChange={handleAudienceChange} /> Admins</label>
                </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish Blog Post'}
            </button>
        </form>
    );
};

export default CreateBlogForm;