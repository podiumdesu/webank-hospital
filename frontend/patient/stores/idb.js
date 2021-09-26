import { openDB } from 'idb';

export const stores = {
    record: 'record',
}

export const db = await openDB('patient', 1, {
  upgrade(db) {
    db.createObjectStore(stores.record);
  },
});
