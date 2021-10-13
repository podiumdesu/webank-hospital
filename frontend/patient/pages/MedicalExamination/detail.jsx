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
import { useAsyncEffect } from '#/hooks/useAsyncEffect';
import { keccak_256 } from 'js-sha3';
import { hexToUint8Array } from '#/utils/codec';
import magnifier from '@/images/medicalRecord/magnifier.png';

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
            sk.deserialize((await db.get(stores.examination, bytes)).sk);
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
            {data ? <div className='flex flex-col gap-2 p-4'>
                <div className='bg-white w-full p-4 rounded-xl relative'>
                    <p className='absolute bottom-0 right-0 rounded-br-lg rounded-tl-lg p-1 px-3 z-20 text-xs text-dark-black bg-[#FBCD6F]'>
                        签名验证{valid === undefined ? '中…' : valid ? '成功' : '失败'}
                    </p>
                    <div className='flex justify-between text-[#60A2F8]'>
                        <div className='flex flex-col justify-between'>
                            <p className='text-lg font-bold'>{data.name}</p>
                            <p className='text-xs'>{data.gender}</p>
                            <p className='text-xs'>{data.age}岁</p>
                        </div>
                        <div className='flex flex-col justify-between text-right'>
                            <p className='text-sm font-bold'>{new Date(data.time).toLocaleString('zh-CN', { dateStyle: 'long' })}</p>
                            <p className='text-sm font-bold'>{data.hospital}</p>
                            <p className='text-xs'>体检单号: {data.number}</p>
                        </div>
                    </div>
                    <table className='text-xs mt-4'>
                        <tbody>
                            {
                                Object.entries({
                                    体检项目: data.project,
                                    登记医生: data.doctor,
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
                {[
                    { title: '一般项目', field: 'general' },
                    { title: '内科', field: 'internal' },
                    { title: '外科', field: 'surgical' },
                    { title: '血常规', field: 'cbc' },
                ].map(({ title, field }) => (
                    <div key={field}>
                        <p className='text-lg font-bold text-dark-black mb-2'>
                            <img src={magnifier} className='inline h-4 mx-1 align-middle' alt='' />
                            {title}
                        </p>
                        <div className='bg-white w-full p-4 rounded-xl relative'>
                            <table className='text-xs w-full'>
                                <thead>
                                    <tr className='text-[#60A2F8]'>
                                        <th>项目名称</th>
                                        <th>结果</th>
                                        <th>参考值</th>
                                        <th>单位</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        data[field].map(({ name, result, unit, reference, id }) => (
                                            <tr key={id} className='my-2 text-[#25261F] text-center'>
                                                <td className='font-bold'>{name}</td>
                                                <td>{result}</td>
                                                <td>{unit}</td>
                                                <td>{reference}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
                {data.attachments.length ? <div>
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
                </div> : null}
            </div> : null}
        </div>
    );
};
