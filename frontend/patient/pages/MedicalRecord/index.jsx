import React, { useState } from 'react';
import { Card } from '@/components/Card';
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
            {records.length > 0 ? (
                records.map(([cid, { time, title, description, attachments }], _idx) => (
                    <Card
                        time={time}
                        title={title}
                        description={description}
                        attachment={attachments}
                        to={CID.decode(cid).toString()}
                        key={_idx}
                    />
                ))
            ) : (
                <div>
                    <img className="w-full mt-12" src='https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg' alt=""/>
                    <p className="text-sm mt-10 text-center">暂时没有您的病历记录哦，期待您加入医链</p>
                </div>
            )}
        </div>
    );
}
