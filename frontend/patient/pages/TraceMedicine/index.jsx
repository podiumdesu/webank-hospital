import React, { useState } from 'react';
import { api } from '@/api';
import { base64ToUint8Array, uint8ArrayToHex } from '#/utils/codec';
import { hash } from '#/utils/rescue';
import { AES } from '#/utils/aes';
import { sha256 } from '#/utils/sha';
import { Steps, Toast } from 'antd-mobile';
import { Scanner } from '#/components/Scanner';
import { CheckOutline, CloseOutline } from 'antd-mobile-icons';
import { deserializeHexStrToPublicKey, deserializeHexStrToSignature, multiPkAggregate, multiVerify } from '#/utils/bls';

const { Step } = Steps;

const verify = (nodes, signature) => {
    if (!nodes.length || !signature.length) {
        return true;
    }
    const pks = [];
    for (let i = 1; i < nodes.length; i++) {
        pks.push(multiPkAggregate([nodes[i - 1].pk, nodes[i].pk]));
    }
    const lastNode = nodes[nodes.length - 1];
    return multiVerify(signature[0], pks, nodes.slice(0, -1).map(({ digest }) => digest)) && lastNode.pk.verify(signature[1], lastNode.digest);
}

export default () => {
    const [nodes, setNodes] = useState([]);
    const [signature, setSignature] = useState([]);
    const [step, setStep] = useState(0);
    const handleData = async (data) => {
        try {
            if (data.length < 32) {
                throw new Error('Invalid tracing code');
            }
            const tracingCode = data.slice(0, 32);
            const id = uint8ArrayToHex(hash(new Uint8Array(32).fill(0), tracingCode));
            const trace = await api.getTraceNodes(id);
            Toast.show({
                icon: <CheckOutline className='mx-auto' />,
                content: '扫描成功',
            });
            setNodes(await Promise.all(trace.map(async ([item, timestamp]) => {
                const buffer = base64ToUint8Array(item);
                const aes = new AES(await AES.convertKey(uint8ArrayToHex(tracingCode)), buffer.slice(0, 12));
                const data = JSON.parse(await aes.decrypt(buffer.slice(12), ''));
                const pk = deserializeHexStrToPublicKey(await api.getPK(data.address));
                return {
                    data,
                    pk,
                    digest: await sha256(buffer),
                    timestamp,
                };
            })));
            setSignature((await api.getTraceSignature(id)).map(deserializeHexStrToSignature));
            setStep(1);
            return true;
        } catch (e) {
            Toast.show({
                icon: <CloseOutline className='mx-auto' />,
                content: e.message,
            });
            return false;
        }
    };
    console.log(signature);
    return (
        <div className='px-4 flex-1 bg-[#C8DBFF33]'>
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
                    <div className='flex flex-col gap-4 bg-white w-full p-4 rounded-xl relative'>
                        <p className='absolute bottom-0 right-0 rounded-br-lg rounded-tl-lg p-1 px-3 z-20 text-xs text-dark-black bg-[#FBCD6F]'>
                            签名验证{verify(nodes, signature) ? '成功' : '失败'}
                        </p>
                        {nodes.map(({ data: { address, ...other } }, index) => (
                            <div key={index}>
                                <div className='flex justify-between gap-3 text-[#60A2F8]'>
                                    <div className='flex flex-col justify-center'>
                                        <p className='text-lg font-bold w-max'>供应链节点{index + 1}</p>
                                    </div>
                                    <div className='flex flex-col justify-center text-right min-w-0'>
                                        <p className='text-xs truncate'>{address}</p>
                                    </div>
                                </div>
                                <table className='text-xs mt-2'>
                                    <tbody>
                                        {
                                            Object.entries(other).map(([k, v]) => (
                                                <tr key={k} className='my-2'>
                                                    <th className='text-left font-normal pr-3 py-1 text-light-black w-20'>{k}:</th>
                                                    <td className='text-[#25261F]'>{v}</td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                ][step]
            }
        </div>
    );
}
