import React from 'react'
import { WingBlank } from 'antd-mobile'
import { RecordCard } from '@/components/RecordCard'
import { db, stores } from '@/stores/idb';

const cids = await db.getAllKeys(stores.record);
const record = await Promise.all(cids.map(async (cid) => [cid, await db.get(stores.record, cid)]));

class App extends React.Component {
    render() {
        return (
            <WingBlank>
            {
                record.map(([cid, { time, title, description, attachments }], _idx) => (
                    <RecordCard time={time} title={title} description={description} 
                                attachment={attachments} key={_idx}></RecordCard>
                ))
            }
            </WingBlank>
        )
    }
}
export default App