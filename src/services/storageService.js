import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../utils/firebaseConfig'; // Ensure 'app' is imported from firebaseConfig

const storage = getStorage(app);

// This function now returns a Promise that resolves with the download URL
// and provides progress updates via a callback.
export const uploadFileToFirebaseStorage = (file, userId, folderPath, onProgress = () => {}) => {
  return new Promise(async (resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided for upload."));
      return;
    }

    // FIX: Add robust checks for file.name and file type
    if (!(file instanceof File) || !file.name) {
      reject(new Error("Invalid file object: provided object is not a File or is missing 'name'."));
      return;
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const storageRef = ref(storage, `${folderPath}/${userId}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress); // Call the progress callback
      },
      (error) => {
        console.error("Firebase Storage upload failed:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at', downloadURL);
          resolve(downloadURL);
        } catch (error) {
          console.error("Error getting download URL:", error);
          reject(error);
        }
      }
    );
  });
};

export const deleteFileFromFirebaseStorage = async (filePath) => {
  if (!filePath) {
    console.warn("No file path provided for deletion.");
    return;
  }
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log(`File deleted from storage: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file from storage (${filePath}):`, error);
    throw error;
  }
};