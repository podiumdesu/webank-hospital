import { Alert, Box, Button, Divider, Paper, Snackbar, Stack, Step, StepContent, StepLabel, Stepper, Typography } from '@mui/material';
import { Scanner } from '#/components/Scanner';
import React, { useEffect, useState, Fragment } from 'react';
import { G1, Fr, GT, keyGen, reDecrypt, idGen, deserialize } from '#/utils/pre';
import { h } from '#/constants';
import { toDataURL } from 'qrcode';
import { CID } from 'multiformats/cid';
import { AES } from '#/utils/aes';
import { api } from '$/api';
import { keccak_256 } from 'js-sha3';
import { hexToUint8Array, uint8ArrayToHex } from '#/utils/codec';
import { SimpleTable } from '$/components/Table';
import { db, stores } from '$/stores/idb';

const Record = ({ data }) => (
    <>
        <Typography variant='h5'>基本信息</Typography>
        <Divider />
        <SimpleTable
            columns={['属性', '值']}
            rows={[
                ['类型', '病历'],
                ['地址', data.address],
                ['单号', data.number],
                ['医院', data.hospital],
                ['科室', data.department],
                ['医生', data.doctor],
                ['姓名', data.name],
                ['性别', data.gender],
                ['年龄', data.age],
                ['日期', new Date(data.time).toLocaleString('zh-CN', { dateStyle: 'long' })],
                ['主诉', data.cc],
                ['既往史', data.history],
                ['体征', data.sign],
                ['诊断意见', data.diagnosis],
                ['诊断计划', data.plan],
            ]}
        />
        <Typography variant='h5'>处方</Typography>
        <Divider />
        <SimpleTable
            columns={['药品名', '剂量']}
            rows={data.drugs.map(({ drug, quantity }) => [drug, quantity])}
        />
        <Typography variant='h5'>辅助检查</Typography>
        <Divider />
        <SimpleTable
            columns={['附件名', 'CID']}
            rows={data.attachments.map(({ name, cid }) => [name, cid])}
        />
    </>
);

const Examination = ({ data }) => (
    <>
        <Typography variant='h5'>基本信息</Typography>
        <Divider />
        <SimpleTable
            columns={['属性', '值']}
            rows={[
                ['类型', '体检报告'],
                ['地址', data.address],
                ['单号', data.number],
                ['项目', data.project],
                ['机构', data.hospital],
                ['医生', data.doctor],
                ['姓名', data.name],
                ['性别', data.gender],
                ['年龄', data.age],
                ['日期', new Date(data.time).toLocaleString('zh-CN', { dateStyle: 'long' })],
            ]}
        />
        {Object.entries({ general: '一般项目', internal: '内科', surgical: '外科', cbc: '血常规'}).map(([field, title]) => (
            <Fragment key={field}>
                <Typography variant='h5'>{title}</Typography>
                <Divider />
                <SimpleTable
                    columns={['项目名称', '结果', '参考值', '单位']}
                    rows={data[field].map(({ name, result, reference, unit }) => [name, result, reference, unit])}
                />
            </Fragment>
        ))}
        <Typography variant='h5'>详细报告</Typography>
        <Divider />
        <SimpleTable
            columns={['附件名', 'CID']}
            rows={data.attachments.map(({ name, cid }) => [name, cid])}
        />
    </>
);

if (!await db.count(stores.metadata, 'sk')) {
    await db.put(stores.metadata, keyGen(h).sk.serialize(), 'sk');
}
const sk = deserialize(await db.get(stores.metadata, 'sk'), Fr);
const pk = keyGen(h, sk).pk;

export const Get = () => {
    const [step, setStep] = useState(0);
    const [src, setSrc] = useState('');
    const [message, setMessage] = useState('');
    const [data, setData] = useState();
    const [valid, setValid] = useState(false);
    useEffect(() => {
        toDataURL([{
            data: pk.serialize(),
            mode: 'byte'
        }]).then(setSrc);
    }, []);
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setMessage('');
    };
    const handleData = async (data) => {
        try {
            const pka = deserialize(data.slice(0, 48), G1);
            const cid = CID.decode(data.slice(48));
            const bid = idGen(pka, pk, cid.bytes).serialize();
            const buffers = [];
            const { cat } = await import('#/utils/ipfs');
            for await (const buffer of cat(cid)) {
                buffers.push(buffer);
            }
            const buffer = new Uint8Array(await new Blob(buffers).arrayBuffer());
            const [[cb0, cb1], timestamp] = await api.getReEncryptedRecord(uint8ArrayToHex(bid));
            const cb = [new Fr(), new GT()];
            cb[0].deserializeHexStr(cb0);
            cb[1].deserializeHexStr(cb1);

            const dk = reDecrypt(cb, sk);
            const aes = new AES(await AES.convertKey(dk), buffer.slice(0, 12));

            {
                const { data, signature, recid } = JSON.parse(await aes.decrypt(buffer.slice(12), ''));
                if (!['record', 'examination'].includes(data.type)) {
                    throw new Error(`Invalid type ${data.type}`);
                }
                setValid(await api.verify(
                    data.address,
                    keccak_256.update(JSON.stringify(data)).array(),
                    recid + 27,
                    hexToUint8Array(signature.slice(0, 64)),
                    hexToUint8Array(signature.slice(64)),
                    timestamp,
                ));
                setData(data);
            }
            setStep(2);
            return true;
        } catch (e) {
            setMessage(e.message);
            return false;
        }
    };
    return (
        <Paper sx={{ p: 1, m: 1, flex: 1, overflow: 'auto' }}>
            <Stepper activeStep={step} orientation='vertical'>
                <Step>
                    <StepLabel>申请授权</StepLabel>
                    <StepContent>
                        <Typography>请让用户扫描下图所示的二维码</Typography>
                        <Box component='img' src={src} display='block' mx='auto' />
                        <Button onClick={() => setStep(1)}>
                            下一步
                        </Button>
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>获取数据</StepLabel>
                    <StepContent>
                        <Typography>请扫描用户出示的二维码</Typography>
                        <Scanner onData={handleData} />
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>数据展示</StepLabel>
                    <StepContent>
                        <Stack spacing={1}>
                            <Alert severity={valid ? 'success' : 'error'}>验证{valid ? '成功' : '失败'}</Alert>
                            {data?.type === 'record' ? <Record data={data} /> : data?.type === 'examination' ? <Examination data={data} /> : null}
                        </Stack>
                    </StepContent>
                </Step>
            </Stepper>
            <Snackbar open={!!message} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity='info' sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};
