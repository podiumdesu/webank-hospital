import React, { useState } from 'react';
import { encrypt, G1, randomGen, keyDer } from '#/utils/pre';
import { AES } from '#/utils/aes';
import { g, h } from '#/constants';
import { toDataURL } from 'qrcode';
import { Alert, Box, Button, Paper, Step, StepContent, StepLabel, Stepper, Typography } from '@mui/material';
import { Scanner } from '#/components/Scanner';
import { keccak_256 } from 'js-sha3';
import { ecdsaSign } from 'secp256k1';
import { clientConfig } from '$/config';
import { uint8ArrayToHex } from '#/utils/codec';

export const EditStepper = ({ Form }) => {
    const [pk, setPK] = useState('');
    const [step, setStep] = useState(0);
    const [result, setResult] = useState('');
    const handleData = (pk) => {
        try {
            const g = new G1();
            g.deserialize(pk);
            setPK(g);
            setStep(1);
            return true;
        } catch {
            return false;
        }
    };
    const handleUpload = async (data) => {
        const dk = randomGen();
        const aes = new AES(await AES.convertKey(dk));
        const { signature, recid } = ecdsaSign(new Uint8Array(keccak_256.update(JSON.stringify(data)).arrayBuffer()), clientConfig.privateKey);
        const c = await aes.encrypt(JSON.stringify({
            data,
            signature: uint8ArrayToHex(signature),
            recid,
        }), 'utf-8', '');
        const { add } = await import('#/utils/ipfs');
        const { cid } = await add(new Blob([aes.iv, c]));
        const [ca0, ca1] = encrypt(dk, keyDer(pk, cid.bytes), g, h);
        setResult(await toDataURL([{
            data: [...cid.bytes, ...ca0.serialize(), ...ca1.serialize()],
            mode: 'byte',
        }]));
        setStep(2);
    };
    const handleFinish = () => {
        setStep(0);
    }
    return (
        <Paper sx={{ p: 1, m: 1, flex: 1, overflow: 'auto' }}>
            <Stepper activeStep={step} orientation="vertical">
                <Step>
                    <StepLabel>获取用户公钥</StepLabel>
                    <StepContent>
                        <Alert severity='info' sx={{ width: '100%', mb: 1 }}>请扫描用户出示的二维码</Alert>
                        <Scanner onData={handleData} style={{ borderRadius: 4 }} />
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>填写信息</StepLabel>
                    <StepContent>
                        <Form onUpload={handleUpload} />
                    </StepContent>
                </Step>
                <Step>
                    <StepLabel>用户上链</StepLabel>
                    <StepContent>
                        <Alert severity='info' sx={{ width: '100%' }}>请让用户扫描如下二维码</Alert>
                        <Box component="img" src={result} display="block" mx='auto' />
                        <Button
                            onClick={handleFinish}
                            variant='contained'
                            color='primary'
                            fullWidth
                        >
                            完成
                        </Button>
                    </StepContent>
                </Step>
            </Stepper>
        </Paper>
    );
};
