import React from 'react';
import { WingBlank, Icon } from 'antd-mobile';
import { RecordCard, CardContainer } from '@/components/RecordCard';
import { Link } from 'react-router-dom'

export default () => {
    return (
        <WingBlank>
            <RecordCard time={Date.now()} title='鸡西市中医医院 外科' description='诊断意见:阑尾炎' attachment='附件:血液检查单' />
            <RecordCard time={Date.now()} title='宝钢医院 呼吸科' description='诊断意见:感冒' />
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
        </WingBlank>
    )
}