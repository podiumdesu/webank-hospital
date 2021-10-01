import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CID } from 'multiformats/cid';
import { db, stores } from '@/stores/idb';
import { Fr, G2, GT, reKeyGen } from '#/utils/pre';
import { Scanner } from '#/components/Scanner';
import { toDataURL } from 'qrcode';
import { Button, Steps, Toast } from 'antd-mobile';
import { CheckOutline, CloseOutline } from 'antd-mobile-icons';
import { reEncrypt } from '#/api';
import { hmac } from '#/utils/hmac';
import { useMobxStore } from '@/stores/mobx';

const { Step } = Steps;

export default () => {
    const { cid } = useParams();
    const [step, setStep] = useState(0);
    const [src, setSrc] = useState('');
    const navigate = useNavigate();
    const store = useMobxStore();
    const handleData = async (buffer) => {
        try {
            const bytes = CID.parse(cid).bytes;
            const sk = new Fr();
            sk.deserialize((await db.get(stores.record, bytes)).sk);
            const pk = new G2();
            pk.deserialize(buffer);
            const rk = reKeyGen(sk, pk);
            const { data } = await reEncrypt(await hmac(bytes, await store.hk, ''), rk.serializeToHexStr());
            const cb = [new Fr(), new GT()];
            cb[0].deserializeHexStr(data[0]);
            cb[1].deserializeHexStr(data[1]);
            setSrc(await toDataURL([{
                data: [...bytes, ...cb[0].serialize(), ...cb[1].serialize()],
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
                icon: <CloseOutline className='mx-auto'/>,
                content: e.message,
            });
            return false;
        }
    };
    return (
        <div className="px-4">
            <Steps current={step}>
                <Step title="开始" />
                <Step title="授权" />
            </Steps>
            {
                [
                    <div className="flex flex-col items-center">
                        <p className="font-bold text-xl">请扫描医生的二维码</p>
                        <Scanner onData={handleData} />
                    </div>,
                    <div className="flex flex-col items-center">
                        <p className="font-bold text-xl">请出示下面的二维码</p>
                        <img src={src} alt='' />
                        <Button onClick={() => navigate('/')}>完成</Button>
                    </div>
                ][step]
            }
        </div>
    );
};
