import React, { useState } from 'react';
import { encrypt, G1, randomGen } from '#/utils/pre';
import { AES } from '#/utils/aes';
import { add } from '#/utils/ipfs';
import { g, h } from '#/constants';
import { toDataURL } from 'qrcode';
import { Box, Button, Dialog, DialogContent, DialogTitle, Step, StepContent, StepLabel, Stepper, Typography } from '@mui/material';
import { Scanner } from '#/components/Scanner';
import { keccak_256 } from 'js-sha3';
import { ecdsaSign } from 'secp256k1';
import { clientConfig } from '$/config';
import { uint8ArrayToHex } from '#/utils/codec';

export const SubmissionDialog = ({ open, data, onFinish }) => {
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
    const handleUpload = async () => {
        const dk = randomGen();
        const aes = new AES(await AES.convertKey(dk));
        const { signature, recid } = ecdsaSign(new Uint8Array(keccak_256.update(JSON.stringify(data)).arrayBuffer()), clientConfig.privateKey);
        const c = await aes.encrypt(JSON.stringify({
            data,
            signature: uint8ArrayToHex(signature),
            recid,
        }), 'utf-8', '');
        const { cid } = await add(new Blob([aes.iv, c]));
        const [ca0, ca1] = encrypt(dk, pk, g, h);
        setResult(await toDataURL([{
            data: [...cid.bytes, ...ca0.serialize(), ...ca1.serialize()],
            mode: 'byte',
        }]));
        setStep(2);
    };
    const handleFinish = () => {
        onFinish();
        setStep(0);
    }
    return (
        <Dialog open={open}>
            <DialogTitle>提交流程</DialogTitle>
            {open && <DialogContent>
                <Stepper activeStep={step} orientation="vertical">
                    <Step>
                        <StepLabel>获取用户公钥</StepLabel>
                        <StepContent>
                            <Typography>请扫描用户出示的二维码</Typography>
                            <Scanner onData={handleData} />
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>加密并上传</StepLabel>
                        <StepContent>
                            <Button onClick={handleUpload}>
                                上传
                            </Button>
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>用户上链</StepLabel>
                        <StepContent>
                            <Typography>请让用户扫描下图所示的二维码</Typography>
                            <Box component="img" src={result} display="block" mx='auto' />
                            <Button onClick={handleFinish}>
                                完成
                            </Button>
                        </StepContent>
                    </Step>
                </Stepper>
            </DialogContent>}
        </Dialog>
    );
};
