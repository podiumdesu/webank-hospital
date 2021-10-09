import React, { useState } from 'react';
import { RecordCard } from '@/components/RecordCard';
import { db, stores } from '@/stores/idb';
import { CID } from 'multiformats/cid';
import { useAsyncEffect } from '#/hooks/useAsyncEffect';

export default () => {
    const [records, setRecords] = useState([]);

    useAsyncEffect(async () => {
        const cids = await db.getAllKeys(stores.record);
        const records = await Promise.all(cids.map(async (cid) => [new Uint8Array(cid), await db.get(stores.record, cid)]));
        setRecords(records.sort(([, a], [, b]) => new Date(b.time) - new Date(a.time)));
    }, []);

    return (
        <div className='px-4'>
            {
                records.map(([cid, { time, title, description, attachments }], _idx) => (
                    <RecordCard
                        time={time}
                        title={title}
                        description={description}
                        attachment={attachments}
                        to={CID.decode(cid).toString()}
                        key={_idx}
                    />
                ))
            }
        </div>
    );
}
