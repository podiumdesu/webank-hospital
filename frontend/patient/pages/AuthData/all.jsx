import React from 'react';
import { WingBlank, Icon } from 'antd-mobile';
import { RecordCard, CardContainer } from '@/components/RecordCard';
import { Link } from 'react-router-dom'
import allMedicalRecord from '@/config/medicalRecord.json'
import allPhysicalExamRecord from '@/config/physicalExam'

const allRecord = allMedicalRecord.concat(allPhysicalExamRecord)

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
                allRecord.map((i, _idx) => (
                    <RecordCard time={i.time} title={i.title} description={i.description} 
                                attachment={i.attachment} key={_idx}></RecordCard>
                ))
            }
        </WingBlank>
    )
}