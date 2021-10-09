import React, { useState } from 'react';
import { Toast } from 'antd-mobile';
import { CloseOutline } from 'antd-mobile-icons';
import { useParams } from 'react-router-dom';

import { CID } from 'multiformats/cid';
import { cat } from '#/utils/ipfs';
import { db, stores } from '@/stores/idb';
import { api } from '@/api';
import { hmac } from '#/utils/hmac';
import { useMobxStore } from '@/stores/mobx';
import { decrypt, Fr, G1 } from '#/utils/pre';
import { h } from '#/constants';
import { AES } from '#/utils/aes';
import { useAsyncEffect } from '#/hooks/useAsyncEffect';
import { keccak_256 } from 'js-sha3';
import { hexToUint8Array } from '#/utils/codec';

export default () => {
    const { cid } = useParams();
    const store = useMobxStore();
    const [data, setData] = useState();
    useAsyncEffect(async () => {
        try {
            const bytes = CID.parse(cid).bytes;
            const id = await hmac(bytes, await store.hk, '');
            const [ca0, ca1] = await api.getRecord(id);
            const ca = [new Fr(), new G1()];
            ca[0].deserializeHexStr(ca0);
            ca[1].deserializeHexStr(ca1);
            const sk = new Fr();
            sk.deserialize((await db.get(stores.examination, bytes)).sk);
            const dk = decrypt(ca, sk, h);
            const buffers = [];
            for await (const buffer of cat(cid)) {
                buffers.push(buffer);
            }
            const buffer = new Uint8Array(await new Blob(buffers).arrayBuffer());
            const aes = new AES(await AES.convertKey(dk), buffer.slice(0, 12));
            const { data, signature, recid } = JSON.parse(await aes.decrypt(buffer.slice(12), ''));
            console.log(await api.verify(
                data.address,
                keccak_256.update(JSON.stringify(data)).array(),
                recid + 27,
                hexToUint8Array(signature.slice(0, 64)),
                hexToUint8Array(signature.slice(64)),
                await api.getRecordTime(id),
            ));
            console.log(data);
            setData(data);
        } catch (e) {
            Toast.show({
                icon: <CloseOutline className='mx-auto' />,
                content: e.message,
            });
        }
    }, [cid]);
    return (
        <div className='flex-1 bg-[#C8DBFF33]'>
            {/* TODO */}
        </div>
    );
};
