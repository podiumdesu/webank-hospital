import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { db, stores } from '@/stores/idb';
import { CID } from 'multiformats/cid';
import { useAsyncEffect } from '#/hooks/useAsyncEffect';

export default () => {
    const [records, setRecords] = useState([]);
    const [examinations, setExaminations] = useState([]);

    useAsyncEffect(async () => {
        const cids = await db.getAllKeys(stores.record);
        const records = await Promise.all(cids.map(async (cid) => [new Uint8Array(cid), await db.get(stores.record, cid)]));
        setRecords(records);
    }, []);
    useAsyncEffect(async () => {
        const cids = await db.getAllKeys(stores.examination);
        const examinations = await Promise.all(cids.map(async (cid) => [new Uint8Array(cid), await db.get(stores.examination, cid)]));
        setExaminations(examinations);
    }, []);

    return (
        <div className='px-4'>
            {
                records
                    .concat(examinations)
                    .sort(([, a], [, b]) => new Date(b.time) - new Date(a.time))
                    .map(([cid, { time, title, description, attachments }], _idx) => (
                        <Card
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
