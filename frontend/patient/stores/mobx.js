import { db, stores } from '@/stores/idb';
import { makeAutoObservable } from 'mobx';
import { deriveKeyFromPassword } from '#/utils/kdf';
import { createContext, useContext } from 'react';
import { g } from '#/constants';
import { keyGen, deserialize, Fr } from '#/utils/pre';

if (!await db.count(stores.metadata, 'salt')) {
    await db.put(stores.metadata, crypto.getRandomValues(new Uint8Array(16)), 'salt');
}

if (!await db.count(stores.metadata, 'sk')) {
    await db.put(stores.metadata, keyGen(g).sk.serialize(), 'sk');
}

const salt = await db.get(stores.metadata, 'salt');
const sk = deserialize(await db.get(stores.metadata, 'sk'), Fr);

export class MobxStore {
    salt = salt;
    sk = sk;
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

    get pk() {
        return keyGen(g, this.sk).pk;
    }
}

export const mobxStore = new MobxStore();
export const mobxStoreContext = createContext(mobxStore);
export const useMobxStore = () => useContext(mobxStoreContext);
