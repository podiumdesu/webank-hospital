import React, { useCallback, useEffect, useState } from 'react';
import { render } from 'react-dom';

import {
    BottomNavigation,
    BottomNavigationAction,
    Button,
    CssBaseline,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Fab,
    IconButton,
    Paper,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    ThemeProvider,
    Toolbar,
    Typography
} from '@mui/material';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { Add, Delete, DeleteForever, Download, Send } from '@mui/icons-material';
import { LocalizationProvider, MobileDatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import jsQR from 'jsqr';
import { Upload } from './components/Textfields/Upload';
import { Controller, useForm } from 'react-hook-form';
import { Input } from './components/Textfields/Input';
import { randomHexString } from './utils/random';
import { toDataURL } from 'qrcode';
import { AES } from './utils/aes';
import { G1, encrypt, generatorGen, randomGen } from './utils/pre';
import { add } from './utils/ipfs';

const EnhancedTable = ({ columns, rows }) => (
    <TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    {columns.map((column, index) => (
                        <TableCell key={index}>
                            {column}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row, index) => (
                    <TableRow hover key={index}>
                        {row.map((cell, index) => (
                            <TableCell key={index}>{cell}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

const Basic = ({ onSubmit }) => {
    const {
        control,
        formState: { isValid },
        handleSubmit,
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            hospital: '人民医院',
            doctor: '刘伟',
            number: randomHexString(),
            name: '',
            gender: '',
            age: '', // TODO: age is string
        }
    });
    return (
        <Paper sx={{ p: 1 }} component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h4" gutterBottom>基本信息</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                    <Input name="hospital" label="医院" control={control} sx={{ flex: 2 }} disabled />
                    <Input name="doctor" label="医生" control={control} sx={{ flex: 1 }} disabled />
                </Stack>
                <Input name="number" label="单号" control={control} disabled />
                <Stack direction="row" spacing={2}>
                    <Input name="name" label="姓名" control={control} />
                    <Input name="gender" label="性别" control={control} />
                    <Input name="age" label="年龄" control={control} type="number" />
                </Stack>
                <Controller
                    name="date"
                    control={control}
                    render={({ field }) => <MobileDatePicker
                        {...field}
                        label="日期"
                        renderInput={(params) => <TextField {...params} />}
                    />}
                />
                <Input name="cc" label="主诉" control={control} multiline rows={3} />
                <Input name="history" label="既往史" control={control} multiline rows={3} />
                <Input name="sign" label="体征" control={control} multiline rows={3} />
                <Input name="diagnosis" label="诊断意见" control={control} multiline rows={3} />
                <Input name="plan" label="诊断计划" control={control} multiline rows={3} />
            </Stack>
            <Fab disabled={!isValid} variant="extended" size="small" color="primary" sx={{ position: 'fixed', top: 16, right: 16, zIndex: 'speedDial' }} type="submit">
                <Send />
                提交
            </Fab>
        </Paper>
    );
};

const Prescription = ({ drugs, setDrugs }) => {
    const {
        control,
        handleSubmit,
        reset,
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            drug: ''
        }
    });
    const onSubmit = ({ drug }) => {
        setDrugs((drugs) => [...drugs, [drug, randomHexString(16)]]);
        reset({ drug: '' });
    };
    return (
        <Paper>
            <Toolbar component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 1 }}>
                <Typography variant="h4" sx={{ flex: 1 }}>处方</Typography>
                <Input name="drug" label="药品名" control={control} sx={{ maxWidth: 150 }} />
                <IconButton type="submit" size="small">
                    <Add />
                </IconButton>
            </Toolbar>
            <EnhancedTable
                columns={[
                    <IconButton onClick={() => {
                        setDrugs([]);
                    }}>
                        <DeleteForever />
                    </IconButton>,
                    '药品名',
                    '溯源码',
                ]}
                rows={drugs.map((drug, i) => [
                    <IconButton onClick={() => {
                        setDrugs((drugs) => drugs.filter((_, j) => i !== j));
                    }}>
                        <Delete />
                    </IconButton>,
                    ...drug
                ])}
            />
        </Paper>
    );
};

const Examination = ({ attachments, setAttachments }) => {
    const {
        control,
        handleSubmit,
        reset,
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            attachment: null
        }
    });
    const onSubmit = ({ attachment }) => {
        setAttachments((attachments) => [...attachments, [attachment?.[0]?.name ?? '', randomHexString(16)]]);
        reset({ attachment: null });
    };
    return (
        <Paper>
            <Toolbar component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 1 }}>
                <Typography variant="h4" sx={{ flex: 1 }}>辅助检查</Typography>
                <Upload
                    name="attachment"
                    label="附件"
                    control={control}
                    placeholder="点击按钮选择"
                    sx={{ maxWidth: 150 }}
                />
                <IconButton type="submit" size="small">
                    <Add />
                </IconButton>
            </Toolbar>
            <EnhancedTable
                columns={[
                    <IconButton onClick={() => {
                        setAttachments([]);
                    }}>
                        <DeleteForever />
                    </IconButton>,
                    '附件名',
                    'CID',
                ]}
                rows={attachments.map((attachment, i) => [
                    <IconButton onClick={() => {
                        setAttachments((attachments) => attachments.filter((_, j) => i !== j));
                    }}>
                        <Delete />
                    </IconButton>,
                    ...attachment
                ])}
            />
        </Paper>
    );
};

const Scanner = ({ onData }) => {
    const ref = useCallback(async (node) => {
        if (!node) {
            return;
        }
        const video = document.createElement("video");
        const canvas = node.getContext("2d");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const tick = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                node.height = video.videoHeight / video.videoWidth * node.width;
                canvas.drawImage(video, 0, 0, node.width, node.height);
                const { data, width, height } = canvas.getImageData(0, 0, node.width, node.height);
                const code = jsQR(data, width, height, {
                    inversionAttempts: "dontInvert",
                });
                if (code) {
                    const { location: { topRightCorner, topLeftCorner, bottomLeftCorner, bottomRightCorner }, binaryData } = code;
                    canvas.beginPath();
                    canvas.moveTo(topLeftCorner.x, topLeftCorner.y);
                    canvas.lineTo(topRightCorner.x, topRightCorner.y);
                    canvas.lineTo(bottomRightCorner.x, bottomRightCorner.y);
                    canvas.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
                    canvas.lineTo(topLeftCorner.x, topLeftCorner.y);
                    canvas.lineWidth = 4;
                    canvas.strokeStyle = "#FF3B58";
                    canvas.stroke();
                    if (onData(binaryData)) {
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }
                }
            }
            requestAnimationFrame(tick);
        }
        video.srcObject = stream;
        video.play();
        requestAnimationFrame(tick);
    }, []);
    return <canvas ref={ref} height={0} style={{ display: 'block', width: '100%' }} />;
};

const { g, h } = generatorGen('foo', 'bar');

const SubmissionDialog = ({ open, data }) => {
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
        console.log(dk);
        const aes = new AES(await AES.convertKey(dk));
        const c = await aes.encrypt(data);
        const iv = aes.iv;
        const { cid } = await add(JSON.stringify({ c, iv }));
        const [ca0, ca1] = encrypt(dk, pk, g, h);
        console.log(cid, cid.bytes);
        console.log(ca0, ca0.serialize());
        console.log(ca1, ca1.serialize());
        setResult(await toDataURL([{
            data: [...cid.bytes, ...ca0.serialize(), ...ca1.serialize()],
            mode: 'byte',
        }]));
        setStep(2);
    };
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
                            <img src={result} />
                        </StepContent>
                    </Step>
                </Stepper>
            </DialogContent>
        </Dialog>
    );
};

const Edit = () => {
    const [drugs, setDrugs] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [data, setData] = useState('');
    const handleSubmit = (data) => {
        setData(JSON.stringify({ ...data, drugs, attachments }));
    };
    return (
        <Stack spacing={1} flex="1" overflow="auto" p={1}>
            <Basic onSubmit={handleSubmit} />
            <Prescription drugs={drugs} setDrugs={setDrugs} />
            <Examination attachments={attachments} setAttachments={setAttachments} />
            <SubmissionDialog open={!!data} data={data} />
        </Stack>
    );
};

const theme = responsiveFontSizes(createTheme({}));

const App = () => {
    const [value, setValue] = useState(0);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Stack height="100vh" bgcolor="#fafafa">
                    {value === 0 ? <Edit /> : null}
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={(_, newValue) => {
                            setValue(newValue);
                        }}
                    >
                        <BottomNavigationAction label="编写病历" icon={<Add />} />
                        <BottomNavigationAction label="获取病历" icon={<Download />} />
                    </BottomNavigation>
                </Stack>
            </ThemeProvider>
        </LocalizationProvider>
    );
};

render(
    <App />,
    document.getElementById('root')
);
