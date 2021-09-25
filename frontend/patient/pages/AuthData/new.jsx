import React, { useEffect, useState } from 'react';
import { toDataURL } from 'qrcode';
import { keyGen, G1, Fr, decrypt } from '#/utils/pre';
import { Scanner } from '#/components/Scanner';
import { g, h } from '#/constants';
import { Steps, Button, Result, Icon, InputItem, List, WingBlank } from 'antd-mobile';
import { CID } from 'multiformats/cid';
import { hmac } from '#/utils/hmac';
import { deriveKeyFromPassword } from '#/utils/kdf';
import { AES } from '#/utils/aes';
import { cat } from '#/utils/ipfs';
import { set } from 'idb-keyval';

const { Step } = Steps;

// TODO: UI for inputting password
const salt = crypto.getRandomValues(new Uint8Array(16));
const password = 'P@ssw0rd';
const { hmac: hk } = await deriveKeyFromPassword(password, salt);

export default () => {
    const [src, setSrc] = useState('');
    const [step, setStep] = useState(0);
    const [cid, setCid] = useState();
    const [ca, setCa] = useState();
    const [sk, setSk] = useState();
    const [memo, setMemo] = useState();
    useEffect(() => {
        const { pk, sk } = keyGen(g);
        toDataURL([{
            data: pk.serialize(),
            mode: 'byte'
        }]).then(setSrc);
        setSk(sk);
    }, []);
    const handleData = (data) => {
        try {
            setCid(CID.decode(data.slice(0, 34)));

            const ca0 = new Fr();
            ca0.deserialize(data.slice(34, 66));
            const ca1 = new G1();
            ca1.deserialize(data.slice(-48));
            setCa([ca0, ca1]);

            setStep(2);
            return true;
        } catch {
            return false;
        }
    }
    const handleUpload = async () => {
        const dk = decrypt(ca, sk, h);
        const buffers = [];
        for await (const buffer of cat(cid)) {
            buffers.push(buffer);
        }
        const buffer = new Uint8Array(await new Blob(buffers).arrayBuffer());
        const aes = new AES(await AES.convertKey(dk), buffer.slice(0, 12));
        const data = JSON.parse(await aes.decrypt(buffer.slice(12), ''));
        await set(cid.bytes, sk);

        const id = await hmac(cid.bytes, hk, '');
        // TODO: call the contract
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
                            <InputItem value={memo} onChange={setMemo} placeholder='请输入简短的备注'>备注</InputItem>
                        </List>
                        <Button className='mt-2' type="primary" onClick={handleUpload}>数据上链</Button>
                    </>,
                ][step]
            }
        </WingBlank>
    )
}