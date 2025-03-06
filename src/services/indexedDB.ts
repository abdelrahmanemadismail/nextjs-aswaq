// services/indexedDB.ts

const DB_NAME = 'aswaq_db';
const DB_VERSION = 1;
const FILE_STORE = 'files';
const FORM_ID = 'listing_form';

interface StoredFile {
  id: string;
  name: string;
  type: string;
  lastModified: number;
  data: ArrayBuffer;
}

/**
 * Initialize the IndexedDB
 */
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create an object store for files if it doesn't exist
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Store files in IndexedDB
 */
export async function storeFiles(files: File[]): Promise<void> {
  try {
    const db = await initDB();
    
    // Convert files to a format that can be stored
    const filesData: StoredFile[] = await Promise.all(
      files.map(async (file, index) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
          id: `${FORM_ID}_${index}`,
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
          data: arrayBuffer
        };
      })
    );

    // Create a NEW transaction for storing metadata
    const metaTx = db.transaction([FILE_STORE], 'readwrite');
    const metaStore = metaTx.objectStore(FILE_STORE);
    
    // Clear existing files for this form
    const clearRequest = metaStore.delete(FORM_ID);
    
    await new Promise<void>((resolve, reject) => {
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
      metaTx.oncomplete = () => resolve();
      metaTx.onerror = () => reject(metaTx.error);
    });

    // If there are no files, we're done
    if (files.length === 0) {
      return;
    }

    // Store file metadata record to track all files for this form
    // Create a NEW transaction for metadata
    const metaDataTx = db.transaction([FILE_STORE], 'readwrite');
    const metaDataStore = metaDataTx.objectStore(FILE_STORE);
    
    const metaRecord = {
      id: FORM_ID,
      fileCount: files.length,
      timestamp: Date.now()
    };
    
    const metaRequest = metaDataStore.put(metaRecord);
    
    await new Promise<void>((resolve, reject) => {
      metaRequest.onsuccess = () => resolve();
      metaRequest.onerror = () => reject(metaRequest.error);
      metaDataTx.oncomplete = () => resolve();
      metaDataTx.onerror = () => reject(metaDataTx.error);
    });

    // Store each file in a separate transaction to avoid the transaction timeout
    for (let i = 0; i < filesData.length; i++) {
      const fileData = filesData[i];
      const fileTx = db.transaction([FILE_STORE], 'readwrite');
      const fileStore = fileTx.objectStore(FILE_STORE);
      
      const fileRequest = fileStore.put(fileData);
      
      await new Promise<void>((resolve, reject) => {
        fileRequest.onsuccess = () => resolve();
        fileRequest.onerror = () => reject(fileRequest.error);
        fileTx.oncomplete = () => resolve();
        fileTx.onerror = () => reject(fileTx.error);
      });
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Error storing files:', error);
    throw error;
  }
}

/**
 * Retrieve files from IndexedDB
 */
export async function retrieveFiles(): Promise<File[]> {
  try {
    const db = await initDB();
    const transaction = db.transaction([FILE_STORE], 'readonly');
    const store = transaction.objectStore(FILE_STORE);

    // Get the metadata to know how many files to expect
    const metaRequest = store.get(FORM_ID);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaRecord = await new Promise<any>((resolve, reject) => {
      metaRequest.onsuccess = () => resolve(metaRequest.result);
      metaRequest.onerror = () => reject(metaRequest.error);
    });

    if (!metaRecord) {
      return [];
    }

    // Retrieve all file entries for this form
    const files: File[] = [];
    for (let i = 0; i < metaRecord.fileCount; i++) {
      const fileId = `${FORM_ID}_${i}`;
      // Create a new transaction for each file to prevent transaction timeout
      const fileTx = db.transaction([FILE_STORE], 'readonly');
      const fileStore = fileTx.objectStore(FILE_STORE);
      const fileRequest = fileStore.get(fileId);
      
      const fileData: StoredFile = await new Promise((resolve, reject) => {
        fileRequest.onsuccess = () => resolve(fileRequest.result);
        fileRequest.onerror = () => reject(fileRequest.error);
      });

      if (fileData) {
        // Convert back to a File object
        const file = new File(
          [fileData.data], 
          fileData.name, 
          { 
            type: fileData.type,
            lastModified: fileData.lastModified 
          }
        );
        files.push(file);
      }
    }

    return files;
  } catch (error) {
    console.error('Error retrieving files:', error);
    return [];
  }
}

/**
 * Clear stored files from IndexedDB
 */
export async function clearFiles(): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([FILE_STORE], 'readwrite');
    const store = transaction.objectStore(FILE_STORE);

    // Get the metadata to know how many files to delete
    const metaRequest = store.get(FORM_ID);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaRecord = await new Promise<any>((resolve, reject) => {
      metaRequest.onsuccess = () => resolve(metaRequest.result);
      metaRequest.onerror = () => reject(metaRequest.error);
    });

    if (!metaRecord) {
      return;
    }

    // Delete all file entries for this form
    const deleteMetaRequest = store.delete(FORM_ID);
    await new Promise<void>((resolve, reject) => {
      deleteMetaRequest.onsuccess = () => resolve();
      deleteMetaRequest.onerror = () => reject(deleteMetaRequest.error);
    });
    
    for (let i = 0; i < metaRecord.fileCount; i++) {
      const fileId = `${FORM_ID}_${i}`;
      const deleteRequest = store.delete(fileId);
      await new Promise<void>((resolve, reject) => {
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      });
    }

    return;
  } catch (error) {
    console.error('Error clearing files:', error);
    throw error;
  }
}