import React from 'react';
import { WingBlank, Icon } from 'antd-mobile';
import { RecordCard, CardContainer } from '@/components/RecordCard';
import { Link } from 'react-router-dom'
import { db, stores } from '@/stores/idb';
import { CID } from 'multiformats/cid';

const cids = await db.getAllKeys(stores.record);
const record = await Promise.all(cids.map(async (cid) => [new Uint8Array(cid), await db.get(stores.record, cid)]));

export default () => {
    return (
        <WingBlank>
            <CardContainer
                left={
                    <div className='flex-1'>
                        <p className='text-dark-black font-bold'>新病历</p>
                    </div>
                }
                right={
                    <div className='flex items-center'>
                        <Link to='new'><Icon type='cross' className='text-6178EE rotate-45' /></Link>
                    </div>
                }
            />
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
