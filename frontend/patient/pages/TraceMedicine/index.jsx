import React, { useState } from 'react';
import { api } from '@/api';
import { base64ToUint8Array, hexToUint8Array, uint8ArrayToHex } from '#/utils/codec';
import { hash } from '#/utils/rescue';
import { AES } from '#/utils/aes';
import { Button, Form, Steps, Toast } from 'antd-mobile';
import { Scanner } from '#/components/Scanner';
import { CheckOutline, CloseOutline } from 'antd-mobile-icons';
import { keccak_256 } from 'js-sha3';
import { useNavigate } from 'react-router-dom';

const { Step } = Steps;

export default () => {
    const navigate = useNavigate();
    const [trace, setTrace] = useState([]);
    const [step, setStep] = useState(0);
    const handleData = async (data) => {
        if (data.length >= 32) {
            const tracingCode = data.slice(0, 32);
            const id = hash(new Uint8Array(32).fill(0), tracingCode);
            const trace = await api.getTrace(uint8ArrayToHex(id));
            Toast.show({
                icon: <CheckOutline className='mx-auto' />,
                content: '扫描成功',
            });
            setTrace(await Promise.all(trace.map(async ([item, timestamp]) => {
                const buffer = base64ToUint8Array(item);
                const aes = new AES(await AES.convertKey(uint8ArrayToHex(tracingCode)), buffer.slice(0, 12));
                const { data, signature, recid } = JSON.parse(await aes.decrypt(buffer.slice(12), ''));
                return {
                    data,
                    valid: await api.verify(
                        data.address,
                        keccak_256.update(JSON.stringify(data)).array(),
                        recid + 27,
                        hexToUint8Array(signature.slice(0, 64)),
                        hexToUint8Array(signature.slice(64)),
                        timestamp,
                    )
                };
            })));
            setStep(1);
            return true;
        } else {
            Toast.show({
                icon: <CloseOutline className='mx-auto' />,
                content: 'Invalid tracing code',
            });
            return false;
        }
    };
    return (
        <div className='px-4'>
            <Steps current={step}>
                <Step title='扫溯源码' />
                <Step title='供应链展示' />
            </Steps>
            {
                [
                    <div className='flex flex-col items-center gap-2'>
                        <p className='font-bold text-xl mt-4'>请扫描药品包装上的溯源码</p>
                        <div className='m-2'>
                            <Scanner onData={handleData} className='rounded-xl' />
                        </div>
                    </div>,
                    <div className="flex flex-col items-center">
                        {trace.map(({ data, valid }, index) => (
                            <div key={index}>
                                <p>供应链节点{index + 1}: 签名验证{valid ? '成功' : '失败'}</p>
                                <Form
                                    layout='horizontal'
                                >
                                    {Object.entries(data).map(([key, value]) => (
                                        <Form.Item label={key} key={key}>
                                            {value}
                                        </Form.Item>
                                    ))}
                                </Form>
                            </div>
                        ))}
                        <Button className='text-[#61A1F8] border-[#61A1F8]' onClick={() => navigate('/')}>完成</Button>
                    </div>
                ][step]
            }
        </div>
    );
}
