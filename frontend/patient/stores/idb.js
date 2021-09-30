import { openDB } from 'idb';

export const stores = {
    record: 'record',
    metadata: 'metadata',
}

export const db = await openDB('patient', 1, {
  upgrade(db) {
    db.createObjectStore(stores.record);
    db.createObjectStore(stores.metadata);
  },
});
