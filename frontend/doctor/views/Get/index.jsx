import { Box, Button, Paper, Step, StepContent, StepLabel, Stepper, Typography } from '@mui/material';
import { Scanner } from '#/components/Scanner';
import React, { useEffect, useState } from 'react';
import { Fr, GT, keyGen, reDecrypt } from '#/utils/pre';
import { h } from '#/constants';
import { toDataURL } from 'qrcode';
import { CID } from 'multiformats/cid';
import { cat } from '#/utils/ipfs';
import { AES } from '#/utils/aes';

export const Get = () => {
    const [step, setStep] = useState(0);
    const [src, setSrc] = useState('');
    const [sk, setSk] = useState();
    useEffect(() => {
        const { pk, sk } = keyGen(h);
        toDataURL([{
            data: pk.serialize(),
            mode: 'byte'
        }]).then(setSrc);
        setSk(sk);
    }, []);
    const handleData = async (data) => {
        try {
            const cid = CID.decode(data.slice(0, 34));
            const buffers = [];
            for await (const buffer of cat(cid)) {
                buffers.push(buffer);
            }
            const buffer = new Uint8Array(await new Blob(buffers).arrayBuffer());

            const cb = [new Fr(), new GT()];
            cb[0].deserialize(data.slice(34, 66));
            cb[1].deserialize(data.slice(66));

            const dk = reDecrypt(cb, sk);
            const aes = new AES(await AES.convertKey(dk), buffer.slice(0, 12));

            console.log(JSON.parse(await aes.decrypt(buffer.slice(12), '')));
            setStep(2);
            return true;
        } catch (e) {
            return false;
        }
    };
    return (
        <Paper sx={{ p: 1, m: 1, flex: 1 }}>
            <Stepper activeStep={step} orientation="vertical">
                <Step>
                    <StepLabel>申请授权</StepLabel>
                    <StepContent>
                        <Typography>请让用户扫描下图所示的二维码</Typography>
                        <Box component="img" src={src} display="block" mx='auto' />
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
                        {/* TODO */}
                    </StepContent>
                </Step>
            </Stepper>
        </Paper>
    );
};
