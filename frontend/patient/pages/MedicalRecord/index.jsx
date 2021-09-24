import React from 'react'
import { WingBlank } from 'antd-mobile'
import { RecordCard } from '@/components/RecordCard'
import allMedicalRecord from '@/config/medicalRecord.json'

class App extends React.Component {
    componentDidMount() {
    }
    render() {
        return (
            <WingBlank>
            {
                allMedicalRecord.map((i, _idx) => (
                    <RecordCard time={i.time} title={i.title} description={i.description} attachment={i.attachment} key={_idx}></RecordCard>
                ))
            }
            </WingBlank>
        )

    }
}
export default App