import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Fr, G2, reKeyGen } from '#/utils/pre';
import { Scanner } from '#/components/Scanner';
import { toDataURL } from 'qrcode';
import { Button, Steps, Toast } from 'antd-mobile';
import { CheckOutline, CloseOutline } from 'antd-mobile-icons';
import { api } from '@/api';
import { hmac } from '#/utils/hmac';
import { useMobxStore } from '@/stores/mobx';
import { ecdh } from 'secp256k1';
import { clientConfig } from '@/config';
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
            const bid = new Uint8Array(state.cid);
            const dh = ecdh(buffer.slice(0, 33), clientConfig.privateKey);
            for (let i = 0; i < 32; i++) {
                bid[i + 2] ^= dh[i];
            }
            const aid = await hmac(state.cid, await store.hk, '');
            const sk = new Fr();
            sk.deserialize(state.sk);
            const pk = new G2();
            pk.deserialize(buffer.slice(33));
            const rk = reKeyGen(sk, pk);
            await api.reEncrypt(aid, uint8ArrayToHex(bid), rk.serializeToHexStr());
            setSrc(await toDataURL([{
                data: [...clientConfig.publicKey, ...state.cid],
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
                        <p className='font-bold text-xl'>请扫描医生的二维码</p>
                        <Scanner onData={handleData} className='rounded-xl' />
                    </div>,
                    <div className='flex flex-col items-center'>
                        <p className='font-bold text-xl'>请出示下面的二维码</p>
                        <img src={src} alt='' />
                        <Button className='text-[#61A1F8] border-[#61A1F8]' onClick={() => navigate('/')}>完成</Button>
                    </div>
                ][step]
            }
        </div>
    );
};
