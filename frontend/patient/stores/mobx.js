import { db, stores } from '@/stores/idb';
import { makeAutoObservable } from 'mobx';
import { deriveKeyFromPassword } from '#/utils/kdf';
import { createContext, useContext } from 'react';

if (!await db.count(stores.metadata, 'salt')) {
    await db.put(stores.metadata, crypto.getRandomValues(new Uint8Array(16)), 'salt');
}

const salt = await db.get(stores.metadata, 'salt');

export class MobxStore {
    salt = salt;
    // TODO: UI for inputting password
    password = 'P@ssw0rd';

    constructor() {
        makeAutoObservable(this);
    }

    setPassword(password) {
        this.password = password;
    }

    get hk() {
        return deriveKeyFromPassword(this.password, this.salt);
    }
}
export const mobxStore = new MobxStore();
export const mobxStoreContext = createContext(mobxStore);
export const useMobxStore = () => useContext(mobxStoreContext);
