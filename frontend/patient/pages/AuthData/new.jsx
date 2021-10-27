import React, { useEffect, useState } from 'react';
import { toDataURL } from 'qrcode';
import { decrypt, Fr, G1, deserialize, keyDer } from '#/utils/pre';
import { Scanner } from '#/components/Scanner';
import { h } from '#/constants';
import { Button, Form, Steps, Toast } from 'antd-mobile';
import { CheckOutline, CloseOutline } from 'antd-mobile-icons';
import { CID } from 'multiformats/cid';
import { hmac } from '#/utils/hmac';
import { AES } from '#/utils/aes';
import { api } from '@/api';
import { db, stores } from '@/stores/idb';
import { useMobxStore } from '@/stores/mobx';
import { useNavigate } from 'react-router-dom';
import { keccak_256 } from 'js-sha3';
import { hexToUint8Array } from '#/utils/codec';

const { Step } = Steps;

export default () => {
    const navigate = useNavigate();
    const [src, setSrc] = useState('');
    const [step, setStep] = useState(0);
    const [cid, setCid] = useState();
    const [ca, setCa] = useState();
    const [data, setData] = useState();
    const [valid, setValid] = useState(false);
    const store = useMobxStore();
    useEffect(() => {
        toDataURL([{
            data: store.pk.serialize(),
            mode: 'byte'
        }]).then(setSrc);
    }, []);
    const handleData = async (data) => {
        try {
            // validate and set cid
            const cid = CID.decode(data.slice(0, 34));
            setCid(cid);

            // validate and set ca
            const ca = [deserialize(data.slice(34, 66), Fr), deserialize(data.slice(-48), G1)];
            setCa(ca);

            // check whether ca is the encryption of dk
            const dk = decrypt(ca, keyDer(store.sk, cid.bytes), h);

            // check whether cid points to a file
            const buffers = [];
            const { cat } = await import('#/utils/ipfs');
            for await (const buffer of cat(cid)) {
                buffers.push(buffer);
            }
            const buffer = new Uint8Array(await new Blob(buffers).arrayBuffer());

            // check whether the file is correctly encrypted
            const aes = new AES(await AES.convertKey(dk), buffer.slice(0, 12));

            // display the data and wait user for approval
            {
                const { data, signature, recid } = JSON.parse(await aes.decrypt(buffer.slice(12), ''));
                setValid(await api.verify(
                    data.address,
                    keccak_256.update(JSON.stringify(data)).array(),
                    recid + 27,
                    hexToUint8Array(signature.slice(0, 64)),
                    hexToUint8Array(signature.slice(64)),
                    Date.now(),
                ));
                setData(data);
            }

            Toast.show({
                icon: <CheckOutline className='mx-auto' />,
                content: '扫描成功',
                afterClose: () => setStep(2),
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
    const handleUpload = async () => {
        try {
            await api.setRecord(await hmac(cid.bytes, await store.hk, ''), ca.map(i => i.serializeToHexStr()));
            switch (data.type) {
                case 'record':
                    await db.put(stores.record, {
                        time: new Date(data.time),
                        title: `${data.hospital} ${data.department}`,
                        description: data.diagnosis,
                        attachments: data.attachments.map(({ name }) => name).join(', '),
                    }, cid.bytes);
                    break;
                case 'examination':
                    await db.put(stores.examination, {
                        time: new Date(data.time),
                        title: `${data.hospital}`,
                        description: data.project,
                        attachments: data.attachments.map(({ name }) => name).join(', '),
                    }, cid.bytes);
                    break;
                default:
                    throw new Error(`Unknown type ${data.type}`);
            }
            Toast.show({
                icon: <CheckOutline className='mx-auto' />,
                content: '提交成功',
                afterClose: () => {
                    navigate('/');
                },
            });
        } catch (e) {
            Toast.show({
                icon: <CloseOutline className='mx-auto' />,
                content: e.message,
            });
        }
    };
    return (
        <div className='px-4'>
            <Steps current={step}>
                <Step title='开始' />
                <Step title='授权' />
                <Step title='上链' />
            </Steps>
            {
                [
                    <div className='flex flex-col items-center'>
                        <p className='font-bold mt-4 text-xl'>请出示下面的二维码</p>
                        <img src={src} alt='' />
                        <Button className='text-[#61A1F8] border-[#61A1F8]' onClick={() => setStep(1)}>下一步</Button>
                    </div>,
                    <div className='flex flex-col items-center gap-2'>
                        <p className='font-bold mt-4 text-xl'>请扫描医生的二维码</p>
                        <Scanner onData={handleData} className='rounded-xl' />
                    </div>,
                    <Form
                        className='flex flex-col items-center gap-2'
                        layout='horizontal'
                        footer={<Button className='text-[#61A1F8] border-[#61A1F8]' onClick={handleUpload}>数据上链</Button>}
                    >
                        <Form.Item label='时间'>
                            {data ? new Date(data.time).toLocaleString('zh-CN', { dateStyle: 'long', timeStyle: 'medium' }) : ''}
                        </Form.Item>
                        <Form.Item label='医院'>
                            {data?.hospital}
                        </Form.Item>
                        <Form.Item label='医生'>
                            {data?.doctor}
                        </Form.Item>
                        <Form.Item label='签名'>
                            {valid ? '有效' : '无效'}
                        </Form.Item>
                    </Form>,
                ][step]
            }
        </div>
    );
}
