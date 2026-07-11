const DB_NAME = 'VCallDB';
const DB_VERSION = 2;
const STORE_NAME = 'recordings';
const CONTACTS_STORE = 'contacts';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(CONTACTS_STORE)) {
        db.createObjectStore(CONTACTS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const saveRecording = async (recordingData) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // recordingData: { roomId, type, blob, timestamp, duration, size }
    const request = store.add(recordingData);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const getAllRecordings = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const deleteRecording = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

// --- CONTACTS --- //

export const saveContact = async (contactData) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONTACTS_STORE], 'readwrite');
    const store = transaction.objectStore(CONTACTS_STORE);
    
    // contactData: { name, subscriptionStr, timestamp }
    const request = store.add(contactData);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const getContacts = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONTACTS_STORE], 'readonly');
    const store = transaction.objectStore(CONTACTS_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const deleteContact = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONTACTS_STORE], 'readwrite');
    const store = transaction.objectStore(CONTACTS_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};
