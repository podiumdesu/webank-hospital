import React, { useState } from 'react';
import { encrypt, G1, randomGen } from '#/utils/pre';
import { AES } from '#/utils/aes';
import { add } from '#/utils/ipfs';
import { g, h } from '$/constants';
import { toDataURL } from 'qrcode';
import { Box, Button, Dialog, DialogContent, DialogTitle, Step, StepContent, StepLabel, Stepper, Typography } from '@mui/material';
import { Scanner } from '$/components/Scanner';

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
        const { cid } = await add(JSON.stringify([await aes.encrypt(data), aes.iv]));
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
            <DialogTitle>提交病历</DialogTitle>
            <DialogContent>
                <Stepper activeStep={step} orientation="vertical">
                    <Step>
                        <StepLabel>获取用户公钥</StepLabel>
                        <StepContent>
                            <Typography>请扫描用户出示的二维码</Typography>
                            <Scanner onData={handleData} />
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>加密并上传病历</StepLabel>
                        <StepContent>
                            <Button onClick={handleUpload}>
                                上传
                            </Button>
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>数据上链</StepLabel>
                        <StepContent>
                            <Typography>请让用户扫描下图所示的二维码</Typography>
                            <Box component="img" src={result} display="block" />
                            <Button onClick={onFinish}>
                                完成
                            </Button>
                        </StepContent>
                    </Step>
                </Stepper>
            </DialogContent>
        </Dialog>
    );
};
