import React from 'react'
import { WingBlank } from 'antd-mobile'
import { RecordCard } from '@/components/RecordCard'
import { db, stores } from '@/stores/idb';
import { CID } from 'multiformats/cid';

const cids = await db.getAllKeys(stores.record);
const record = await Promise.all(cids.map(async (cid) => [new Uint8Array(cid), await db.get(stores.record, cid)]));

export default () => {
    return (
        <WingBlank>
            {
                record.map(([cid, { time, title, description, attachments }], _idx) => (
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
        </WingBlank>
    )
}
