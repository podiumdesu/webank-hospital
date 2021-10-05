import React, { useEffect, useState } from 'react';
import { Toast } from 'antd-mobile';
import { CloseOutline } from 'antd-mobile-icons';
import { useParams } from 'react-router-dom';
import magnifier from '@/images/medicalRecord/magnifier.png';
import pill from '@/images/medicalRecord/pill.png';
import { CID } from 'multiformats/cid';
import { cat } from '#/utils/ipfs';
import { db, stores } from '@/stores/idb';
import { getRecord } from '#/api/v2';
import { hmac } from '#/utils/hmac';
import { useMobxStore } from '@/stores/mobx';
import { decrypt, Fr, G1 } from '#/utils/pre';
import { h } from '#/constants';
import { AES } from '#/utils/aes';

export default () => {
    const { cid } = useParams();
    const store = useMobxStore();
    const [data, setData] = useState();
    useEffect(() => {
        (async () => {
            try {
                const bytes = CID.parse(cid).bytes;
                const [ca0, ca1] = await getRecord(await hmac(bytes, await store.hk, ''));
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
                setData(JSON.parse(await aes.decrypt(buffer.slice(12), '')));
            } catch (e) {
                Toast.show({
                    icon: <CloseOutline className='mx-auto' />,
                    content: e.message,
                })
            }
        })();
    }, [cid]);
    return (
        <div className="flex-1 bg-[#C8DBFF33]">
            {data ? <div className="flex flex-col gap-5 p-4">
                <div className="bg-white w-full p-4 rounded-xl">
                    <div className="flex justify-between text-[#60A2F8]">
                        <div className="flex flex-col justify-between">
                            <p className="text-lg font-bold">{data.name}</p>
                            <p className="text-xs">{data.gender}</p>
                            <p className="text-xs">{data.age}岁</p>
                        </div>
                        <div className="flex flex-col justify-between text-right">
                            <p className="text-sm font-bold">{new Date(data.time).toLocaleString('zh-CN', { dateStyle: 'long'})}</p>
                            <p className="text-sm font-bold">{data.hospital}</p>
                            <p className="text-xs">病历单号: {data.number}</p>
                        </div>
                    </div>
                    <table className="text-xs mt-5">
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
                                    <tr key={k} className="my-2">
                                        <th className="text-left font-normal pr-3 py-1 text-light-black">{k}:</th>
                                        <td className="text-[#25261F]">{v}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <div>
                    <p className="text-lg font-bold text-dark-black mb-2">
                        <img src={pill} className="inline h-4 mx-1 align-middle" alt='' />
                        西药处方
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {data.drugs.map(([name, code], index) => (
                            <div key={index}>
                                <div className="bg-white h-24 rounded-t-xl">{/*TODO*/}</div>
                                <div className="rounded-b-xl py-2 text-center bg-[#AFD0FB] text-dark-black">
                                    <p className="font-bold text-xs">{name}</p>
                                    <p className="font-medium text-2xs">溯源码: {code}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-lg font-bold text-dark-black mb-2">
                        <img src={magnifier} className="inline h-4 mx-1 align-middle" alt='' />
                        辅助检查
                    </p>
                    <div className="bg-white w-full p-4 rounded-xl flex flex-col gap-1">
                        {data.attachments.map(([name, cid], index) => (
                            <div key={index}>
                                <span className="text-sm text-dark-black mr-3">{name}</span>
                                <span className="text-2xs bg-[#AFD0FB] text-[#3C55D5] px-2 py-0.5 rounded-lg" onClick={() => {
                                    console.log(cid); // TODO
                                }}>点击下载</span>
                            </div>
                        ))}
                        <p className="text-2xs text-[#3C55D5] mt-3">是否支持下载报告？</p>
                    </div>
                </div>
            </div> : null}
        </div>
    );
};
