import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { G2, reKeyGen, keyDer, deserialize, idGen } from '#/utils/pre';
import { Scanner } from '#/components/Scanner';
import { toDataURL } from 'qrcode';
import { Button, Steps, Toast } from 'antd-mobile';
import { CheckOutline, CloseOutline } from 'antd-mobile-icons';
import { api } from '@/api';
import { hmac } from '#/utils/hmac';
import { useMobxStore } from '@/stores/mobx';
import { uint8ArrayToHex } from '#/utils/codec';

const { Step } = Steps;

export default () => {
    const { state } = useLocation();
    const [step, setStep] = useState(0);
    const [src, setSrc] = useState('');
    const navigate = useNavigate();
    const store = useMobxStore();
    if (!state) {
        return null;
    }
    const handleData = async (buffer) => {
        try {
            const pkb = deserialize(buffer, G2);
            const bid = idGen(store.pk, pkb, state.cid).serialize();
            const aid = await hmac(state.cid, await store.hk, '');
            const rk = reKeyGen(keyDer(store.sk, state.cid), pkb);
            await api.reEncrypt(aid, uint8ArrayToHex(bid), rk.serializeToHexStr());
            setSrc(await toDataURL([{
                data: [...store.pk.serialize(), ...state.cid],
                mode: 'byte'
            }]));
            Toast.show({
                icon: <CheckOutline className='mx-auto' />,
                content: '扫描成功',
                afterClose: () => setStep(1),
            });
            return true;
        } catch (e) {
            Toast.show({
                icon: <CloseOutline className='mx-auto' />,
                content: e.message,
            });
            return false;
        }
    };
    return (
        <div className='px-4'>
            <Steps current={step}>
                <Step title='开始' />
                <Step title='授权' />
            </Steps>
            {
                [
                    <div className='flex flex-col items-center gap-2'>
                        <p className='font-bold text-xl mt-4'>请扫描医生的二维码</p>
                        <div className='m-2'>
                            <Scanner onData={handleData} className='rounded-xl' />
                        </div>
                    </div>,
                    <div className='flex flex-col items-center'>
                        <p className='font-bold text-xl mt-4'>请出示下面的二维码</p>
                        <img src={src} alt='' />
                        <Button className='text-[#61A1F8] border-[#61A1F8]' onClick={() => navigate('/')}>完成</Button>
                    </div>
                ][step]
            }
        </div>
    );
};
