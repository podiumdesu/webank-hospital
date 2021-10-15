import React, { useState } from 'react';
import { Toast } from 'antd-mobile';
import { CloseOutline } from 'antd-mobile-icons';
import { useParams } from 'react-router-dom';

import { CID } from 'multiformats/cid';
import { cat } from '#/utils/ipfs';
import { db, stores } from '@/stores/idb';
import { api } from '@/api';
import { hmac } from '#/utils/hmac';
import { useMobxStore } from '@/stores/mobx';
import { decrypt, Fr, G1 } from '#/utils/pre';
import { h } from '#/constants';
import { AES } from '#/utils/aes';

import magnifier from '@/images/medicalRecord/magnifier.png';
import pill from '@/images/medicalRecord/pill.png';
import banlangen from '@/images/medicineImg/banlangen.png';
import dy35 from '@/images/medicineImg/dy35.png';
import lianhua from '@/images/medicineImg/lianhua.png';
import toubao from '@/images/medicineImg/toubao.png';
import nacl from '@/images/medicineImg/nacl.png';
import momisong from '@/images/medicineImg/momisong.jpg';
import mianqian from '@/images/medicineImg/mianqian.jpg';
import luganshi from '@/images/medicineImg/luganshi.jpg';
import { useAsyncEffect } from '#/hooks/useAsyncEffect';
import { keccak_256 } from 'js-sha3';
import { hexToUint8Array } from '#/utils/codec';

const medicineImg = {
    '板蓝根': banlangen,
    '达英35': dy35,
    '莲花清瘟': lianhua,
    '头孢': toubao,
    '生理盐水': nacl,
    '氯化钠': nacl,
    '莫米松乳膏': momisong,
    '棉签': mianqian,
    '炉甘石洗剂': luganshi
};

export default () => {
    const { cid } = useParams();
    const store = useMobxStore();
    const [data, setData] = useState();
    const [valid, setValid] = useState();
    useAsyncEffect(async () => {
        try {
            const bytes = CID.parse(cid).bytes;
            const id = await hmac(bytes, await store.hk, '');
            const [[ca0, ca1], timestamp] = await api.getRecord(id);
            const ca = [new Fr(), new G1()];
            ca[0].deserializeHexStr(ca0);
            ca[1].deserializeHexStr(ca1);
            const sk = new Fr();
            sk.deserialize((await db.get(stores.record, bytes)).sk);
            const dk = decrypt(ca, sk, h);
            const buffers = [];
            for await (const buffer of cat(cid)) {
                buffers.push(buffer);
            }
            const buffer = new Uint8Array(await new Blob(buffers).arrayBuffer());
            const aes = new AES(await AES.convertKey(dk), buffer.slice(0, 12));
            const { data, signature, recid } = JSON.parse(await aes.decrypt(buffer.slice(12), ''));
            setData(data);
            setValid(await api.verify(
                data.address,
                keccak_256.update(JSON.stringify(data)).array(),
                recid + 27,
                hexToUint8Array(signature.slice(0, 64)),
                hexToUint8Array(signature.slice(64)),
                timestamp,
            ));
        } catch (e) {
            Toast.show({
                icon: <CloseOutline className='mx-auto' />,
                content: e.message,
            });
        }
    }, [cid]);
    return (
        <div className='flex-1 bg-[#C8DBFF33]'>
            {data ? <div className='flex flex-col gap-5 p-4'>
                <div className='bg-white w-full p-4 rounded-xl relative'>
                    <p className='absolute bottom-0 right-0 rounded-br-lg rounded-tl-lg p-1 px-3 z-20 text-xs text-dark-black bg-[#FBCD6F]'>
                        签名验证{valid === undefined ? '中…' : valid ? '成功' : '失败'}
                    </p>
                    <div className='flex justify-between text-[#60A2F8]'>
                        <div className='flex flex-col justify-between'>
                            <p className='text-lg font-bold w-max'>{data.name}</p>
                            <p className='text-xs'>{data.gender}</p>
                            <p className='text-xs'>{data.age}岁</p>
                        </div>
                        <div className='flex flex-col justify-between text-right min-w-0'>
                            <p className='text-sm font-bold'>{new Date(data.time).toLocaleString('zh-CN', { dateStyle: 'long' })}</p>
                            <p className='text-sm font-bold'>{data.hospital}</p>
                            <p className='text-xs truncate'>病历单号: {data.number}</p>
                        </div>
                    </div>
                    <table className='text-xs mt-4'>
                        <tbody>
                            {
                                Object.entries({
                                    就诊医生: data.doctor,
                                    主诉: data.cc,
                                    既往史: data.history,
                                    体征: data.sign,
                                    诊断意见: data.diagnosis,
                                    诊断计划: data.plan,
                                }).map(([k, v]) => (
                                    <tr key={k} className='my-2'>
                                        <th className='text-left font-normal pr-3 py-1 text-light-black w-20'>{k}:</th>
                                        <td className='text-[#25261F]'>{v}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <div>
                    <p className='text-lg font-bold text-dark-black mb-2'>
                        <img src={pill} className='inline h-4 mx-1 align-middle' alt='' />
                        西药处方
                    </p>
                    <div className='grid grid-cols-2 gap-3'>
                        {data.drugs.map(({ drug, quantity }, index) => (
                            <div key={index}>
                                <div className='bg-white h-24 rounded-t-xl flex justify-center py-1'>
                                    <img className='h-full' src={medicineImg[drug] ? medicineImg[drug] : ''} alt='' />
                                </div>
                                <div className='rounded-b-xl py-2 text-center bg-[#AFD0FB] text-dark-black'>
                                    <p className='font-bold text-xs'>药品名: {drug}</p>
                                    <p className='font-medium text-2xs'>剂量: {quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {
                    data.attachments.length > 0 ?
                        <div>
                            <p className='text-lg font-bold text-dark-black mb-2'>
                                <img src={magnifier} className='inline h-4 mx-1 align-middle' alt='' />
                                辅助检查
                            </p>
                            <div className='bg-white w-full p-4 rounded-xl flex flex-col gap-1'>
                                {data.attachments.map(({ name, cid, dk }, index) => (
                                    <div key={index}>
                                        <span className='text-sm text-dark-black mr-3'>{name}</span>
                                        <span className='text-2xs bg-[#AFD0FB] text-[#3C55D5] px-2 py-0.5 rounded-lg' onClick={async () => {
                                            const buffers = [];
                                            for await (const buffer of cat(cid)) {
                                                buffers.push(buffer);
                                            }
                                            const buffer = new Uint8Array(await new Blob(buffers).arrayBuffer());
                                            const aes = new AES(await AES.convertKey(dk), buffer.slice(0, 12));
                                            const url = URL.createObjectURL(new Blob([await aes.decrypt(buffer.slice(12), '', '')]));
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = name;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        }}>点击下载</span>
                                    </div>
                                ))}
                            </div>
                        </div> : (<></>)
                }
            </div> : null}
        </div>
    );
};
