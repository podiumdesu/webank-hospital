import { openDB } from 'idb';

export const stores = {
    metadata: 'metadata',
}

export const db = await openDB('doctor', 1, {
  upgrade(db) {
    db.createObjectStore(stores.metadata);
  },
});
