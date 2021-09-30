import React from 'react';
import { WingBlank } from 'antd-mobile';
import magnifier from '@/images/medicalRecord/magnifier.png';
import pill from '@/images/medicalRecord/pill.png';

export default () => {
    return (
        <div className='flex-1 bg-[#C8DBFF33]'>
            <WingBlank className='flex flex-col gap-5 py-4'>
                <div className='bg-white w-full p-4 rounded-xl'>
                    <div className='flex justify-between text-[#60A2F8]'>
                        <div className='flex flex-col justify-between'>
                            <p className='text-lg font-bold'>李小红</p>
                            <p className='text-xs'>女</p>
                            <p className='text-xs'>23岁</p>
                        </div>
                        <div className='flex flex-col justify-between text-right'>
                            <p className='text-sm font-bold'>2020年1月19日</p>
                            <p className='text-sm font-bold'>华山医院</p>
                            <p className='text-xs'>病历单号:2839580498260103</p>
                        </div>
                    </div>
                    <table className='text-xs mt-5'>
                        <tbody>
                            {
                                Object.entries({
                                    就诊医生: '张三',
                                    主诉: '转移性右下腹痛,肘部疼痛,屁股痛',
                                    既往史: '无',
                                    体征: '良好,呼吸顺畅',
                                    诊断意见: '车祸致骨折,建议住院治疗',
                                    诊断计划: '住院并定期随访',
                                }).map(([k, v]) => (
                                    <tr key={k} className='my-2'>
                                        <th className='text-left font-normal pr-3 py-1 text-light-black'>{k}:</th>
                                        <td className='text-[#25261F]'>{v}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <div>
                    <p className='text-lg font-bold text-dark-black mb-2'>
                        <img src={pill} className='inline h-4 mx-1 align-middle' />
                        西药处方
                    </p>
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <div className='bg-white h-24 rounded-t-xl'>
                            </div>
                            <div className='rounded-b-xl py-2 text-center bg-[#AFD0FB] text-dark-black'>
                                <p className='font-bold text-xs'>膏药100mg×5</p>
                                <p className='font-medium text-2xs'>溯源码: 2350285284572841</p>
                            </div>
                        </div>
                        <div>
                            <div className='bg-white h-24 rounded-t-xl'>
                            </div>
                            <div className='rounded-b-xl py-2 text-center bg-[#AFD0FB] text-dark-black'>
                                <p className='font-bold text-xs'>0.9%氯化钠溶液</p>
                                <p className='font-medium text-2xs'>溯源码: 234245245832758</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <p className='text-lg font-bold text-dark-black mb-2'>
                        <img src={magnifier} className='inline h-4 mx-1 align-middle' />
                        辅助检查
                    </p>
                    <div className='bg-white w-full p-4 rounded-xl flex flex-col gap-1'>
                        <div>
                            <span className='text-sm text-dark-black mr-3'>肘部CT</span>
                            <span className='text-2xs bg-[#AFD0FB] text-[#3C55D5] px-2 py-0.5 rounded-lg'>点击下载</span>
                        </div>
                        <div>
                            <span className='text-sm text-dark-black mr-3'>尾椎骨核磁共振</span>
                            <span className='text-2xs bg-[#AFD0FB] text-[#3C55D5] px-2 py-0.5 rounded-lg'>点击下载</span>
                        </div>
                        <p className='text-2xs text-[#3C55D5] mt-3'>是否支持下载报告？</p>
                    </div>
                </div>
            </WingBlank>
        </div>
    )
};
