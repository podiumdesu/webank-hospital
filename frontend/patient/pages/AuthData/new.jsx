import React, { useEffect, useState } from 'react';
import { toDataURL } from 'qrcode';
import { keyGen, G1, Fr, decrypt } from '#/utils/pre';
import { Scanner } from '#/components/Scanner';
import { g, h } from '#/constants';
import { Toast, Steps, Button, List, WingBlank } from 'antd-mobile';
import { CID } from 'multiformats/cid';
import { hmac } from '#/utils/hmac';
import { AES } from '#/utils/aes';
import { cat } from '#/utils/ipfs';
import { setRecord } from '#/api';
import { db, stores } from '@/stores/idb';
import { useMobxStore } from '@/stores/mobx';
import { useNavigate } from 'react-router-dom';

const { Step } = Steps;

export default () => {
    const navigate = useNavigate();
    const [src, setSrc] = useState('');
    const [step, setStep] = useState(0);
    const [cid, setCid] = useState();
    const [ca, setCa] = useState();
    const [sk, setSk] = useState();
    const [data, setData] = useState();
    const store = useMobxStore();
    useEffect(() => {
        const { pk, sk } = keyGen(g);
        toDataURL([{
            data: pk.serialize(),
            mode: 'byte'
        }]).then(setSrc);
        setSk(sk);
    }, []);
    const handleData = async (data) => {
        try {
            // validate and set cid
            const cid = CID.decode(data.slice(0, 34));
            setCid(cid);

            // validate and set ca
            const ca = [new Fr(), new G1()];
            ca[0].deserialize(data.slice(34, 66));
            ca[1].deserialize(data.slice(-48));
            setCa(ca);

            // check whether ca is the encryption of dk
            const dk = decrypt(ca, sk, h);

            // check whether cid points to a file
            const buffers = [];
            for await (const buffer of cat(cid)) {
                buffers.push(buffer);
            }
            const buffer = new Uint8Array(await new Blob(buffers).arrayBuffer());

            // check whethter the file is correctly encrypted
            const aes = new AES(await AES.convertKey(dk), buffer.slice(0, 12));

            // display the data and wait user for approvement
            setData(JSON.parse(await aes.decrypt(buffer.slice(12), '')));

            setStep(2);
            Toast.success('扫描成功');
            return true;
        } catch (e) {
            Toast.fail(e.message);
            return false;
        }
    }
    const handleUpload = async () => {
        try {
            await setRecord(await hmac(cid.bytes, await store.hk, ''), ca.map(i => i.serializeToHexStr()));
            await db.put(stores.record, {
                time: new Date(data.time),
                title: `${data.hospital} ${data.department}`,
                description: data.diagnosis,
                attachments: data.attachments.map(([name]) => name).join(', '),
                sk: sk.serialize()
            }, cid.bytes);
            Toast.success('提交成功', 1, () => {
                navigate('/');
            });
        } catch (e) {
            Toast.fail(e.message);
        }
    }
    return (
        <WingBlank>
            <Steps current={step} direction="horizontal" size="small">
                <Step title='开始' />
                <Step title='授权' />
                <Step title='上链' />
            </Steps>
            {
                [
                    <div className='flex flex-col items-center'>
                        <p className='font-bold text-xl'>请出示下面的二维码</p>
                        <img src={src} />
                        <Button type="primary" inline onClick={() => setStep(1)}>下一步</Button>
                    </div>,
                    <div className='flex flex-col items-center'>
                        <p className='font-bold text-xl'>请扫描医生的二维码</p>
                        <Scanner onData={handleData} />
                    </div>,
                    <>
                        <List>
                            <List.Item extra={data?.hospital}>
                                医院
                            </List.Item>
                            <List.Item extra={data?.doctor}>
                                医生
                            </List.Item>
                            <List.Item extra={data?.diagnosis}>
                                诊断意见
                            </List.Item>
                        </List>
                        <Button className='mt-2' type="primary" onClick={handleUpload}>数据上链</Button>
                    </>,
                ][step]
            }
        </WingBlank>
    )
}
