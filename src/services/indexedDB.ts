// services/indexedDB.ts

const DB_NAME = 'aswaq_db';
const DB_VERSION = 1;
const FILE_STORE = 'files';
const FORM_ID = 'listing_form';
const EXPIRATION_TIME = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

interface StoredFile {
  id: string;
  name: string;
  type: string;
  lastModified: number;
  data: ArrayBuffer;
  timestamp: number; // Add timestamp for expiration
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
        const store = db.createObjectStore(FILE_STORE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Check if stored data has expired
 */
async function checkExpiration(db: IDBDatabase): Promise<boolean> {
  return new Promise((resolve) => {
    const transaction = db.transaction([FILE_STORE], 'readonly');
    const store = transaction.objectStore(FILE_STORE);
    const request = store.get(FORM_ID);

    request.onsuccess = () => {
      const record = request.result;
      if (!record || !record.timestamp) {
        resolve(true);
        return;
      }

      const hasExpired = Date.now() - record.timestamp > EXPIRATION_TIME;
      resolve(hasExpired);
    };

    request.onerror = () => resolve(true);
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
          data: arrayBuffer,
          timestamp: Date.now()
        };
      })
    );

    const metaTx = db.transaction([FILE_STORE], 'readwrite');
    const metaStore = metaTx.objectStore(FILE_STORE);
    
    const clearRequest = metaStore.delete(FORM_ID);
    
    await new Promise<void>((resolve, reject) => {
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
      metaTx.oncomplete = () => resolve();
      metaTx.onerror = () => reject(metaTx.error);
    });

    if (files.length === 0) {
      return;
    }

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

    // Check for expiration
    const hasExpired = await checkExpiration(db);
    if (hasExpired) {
      await clearFiles();
      return [];
    }

    const transaction = db.transaction([FILE_STORE], 'readonly');
    const store = transaction.objectStore(FILE_STORE);

    const metaRequest = store.get(FORM_ID);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaRecord = await new Promise<any>((resolve, reject) => {
      metaRequest.onsuccess = () => resolve(metaRequest.result);
      metaRequest.onerror = () => reject(metaRequest.error);
    });

    if (!metaRecord) {
      return [];
    }

    const files: File[] = [];
    for (let i = 0; i < metaRecord.fileCount; i++) {
      const fileId = `${FORM_ID}_${i}`;
      const fileTx = db.transaction([FILE_STORE], 'readonly');
      const fileStore = fileTx.objectStore(FILE_STORE);
      const fileRequest = fileStore.get(fileId);
      
      const fileData: StoredFile = await new Promise((resolve, reject) => {
        fileRequest.onsuccess = () => resolve(fileRequest.result);
        fileRequest.onerror = () => reject(fileRequest.error);
      });

      if (fileData) {
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

    const metaRequest = store.get(FORM_ID);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaRecord = await new Promise<any>((resolve, reject) => {
      metaRequest.onsuccess = () => resolve(metaRequest.result);
      metaRequest.onerror = () => reject(metaRequest.error);
    });

    if (!metaRecord) {
      return;
    }

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