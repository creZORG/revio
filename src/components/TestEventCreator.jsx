import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

import styles from './TestEventCreator.module.css'; // Import its own CSS module

// Your Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwP2YVy_Z2y4fJ52tWyZsvnyya2HAMnHk",
    authDomain: "naksyetu-9c648.firebaseapp.com",
    projectId: "naksyetu-9c648",
    storageBucket: "naksyetu-9c648.firebasestorage.app",
    messagingSenderId: "147113503727",
    appId: "1:147113503727:web:1d9d351c30399b2970241a",
    measurementId: "G-6DTTXJ859H"
};

// Initialize Firebase (only once)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Define the global __app_id variable (as it would be in your main app)
const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const TestEventCreator = () => {
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const handleCreateTestEvent = async () => {
        setMessage('');
        setMessageType('');

        // The problematic path we've been trying to use
        const collectionPath = `artifacts/${appId}/public/events`; // This is the path that caused the error
        // Or the path I last tried: `artifacts/${appId}/public_collections/events`
        // Or the path I last tried: `artifacts/${appId}/public/all_events_doc/events`

        // Let's use the exact path that caused the error for diagnosis
        const testPath = `artifacts/${appId}/public/events`;

        console.log("Attempting to create event at path:", testPath);

        try {
            const eventsCollectionRef = collection(db, testPath); // THIS IS THE LINE THAT THROWS THE ERROR

            const testEventData = {
                eventName: "Test Event from Seeder",
                description: "This is a test event to diagnose Firestore pathing.",
                createdAt: Timestamp.now(),
                organizerId: "test_seeder_uid",
                source: "Test Tool"
            };

            await addDoc(eventsCollectionRef, testEventData);
            setMessage('Test event created successfully!');
            setMessageType('success');
            console.log("SUCCESS: Test event created at:", testPath);

        } catch (error) {
            setMessage(`Error: ${error.message}`);
            setMessageType('error');
            console.error("ERROR: Test event creation failed:", error);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Firestore Path Test Tool</h1>
            <p>This tool attempts to create a document in Firestore using the problematic path.</p>
            <p>Your `appId` is: <code>{appId}</code></p>
            <p>The path being tested is: <code>{`artifacts/${appId}/public/events`}</code></p> {/* Display the exact path being tested */}

            <button onClick={handleCreateTestEvent} className={styles.button}>
                Create Test Event
            </button>

            {message && (
                <div className={`${styles.messageBox} ${styles[messageType]}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default TestEventCreator;