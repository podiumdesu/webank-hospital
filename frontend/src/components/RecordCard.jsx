import React from "react";
import { Icon } from "antd-mobile";

export const CardContainer = ({ left, right, children }) => {
    return (
        <div className='w-full my-3 p-4 rounded-lg flex relative' style={{ backgroundColor: 'rgba(200, 219, 255, 20%)' }}>
            {left}
            {right}
            {children}
        </div>
    )
}

export const RecordCard = ({ time, title, description, attachment }) => {
    return (
        <CardContainer
            left={
                <div className='flex-1'>
                    <p className='text-dark-black font-medium mb-1.5'>{new Date(time).toLocaleString('zh-CN', { dateStyle: 'long' })}</p>
                    <p className='text-dark-black font-semibold text-base mb-0.5'>{title}</p>
                    <p className='text-6178EE'>{description}</p>
                </div>
            }
            right={
                <div className='flex items-center'>
                    <Icon type='right' className='text-6178EE' />
                </div>
            }
        >
            {attachment && <p
                className='absolute top-0 right-0 rounded-bl-lg rounded-tr-lg p-1 px-3 z-20 text-xs'
                style={{ color: '#252517', background: '#FBCD6F' }}
            >{attachment}</p>}
        </CardContainer>
    )
}