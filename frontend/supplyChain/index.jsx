import React, { useState } from 'react';
import { render } from 'react-dom';
import {
    Alert,
    Button,
    CssBaseline,
    MenuItem,
    Snackbar,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    TextField,
    ThemeProvider
} from '@mui/material';
import { Input } from '$/components/Textfields/Input';
import { useForm } from 'react-hook-form';
import { LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { keccak_256 } from 'js-sha3';
import { hexToUint8Array, uint8ArrayToBase64, uint8ArrayToHex } from '#/utils/codec';
import { ecdsaSign } from 'secp256k1';
import { AES } from '#/utils/aes';
import { hash, prove } from '#/utils/rescue';
import { Table } from '$/components/Table';
import { API, ClientConfig } from '#/api/v2';
import { Scanner } from '#/components/Scanner';

const getDefaultValue = () => ({
    name: '',
    value: '',
});

const identities = [
    { name: '生产商', privateKey: 'f7aa567e075df14664637e96de0fb3a44a77e400e1eecb3392a2055b0c190a29' },
    { name: '运输公司', privateKey: '6cc9e434e5b4ecc62c2f66deabd87487127c0a664214d14b162f39ce9e564b5e' },
    { name: '药房', privateKey: 'caaad6e117b5f1ca4cfd08217a0a1343342ce96769ccaf93b9ea3c1026ceb986' },
];

const App = () => {
    const [step, setStep] = useState(0);
    const [props, setProps] = useState([]);
    const [privateKey, setPrivateKey] = useState(identities[0].privateKey);
    const [tracingCode, setTracingCode] = useState();
    const [message, setMessage] = useState('');
    const {
        control,
        formState: { isValid },
        reset,
        handleSubmit,
    } = useForm({
        mode: 'onChange',
        defaultValues: getDefaultValue()
    });
    const handleReset = () => reset(getDefaultValue());

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setMessage('');
    };
    const handleData = (data) => {
        if (data.length >= 32) {
            setTracingCode(data.slice(0, 32));
            setStep(2);
            return true;
        } else {
            setMessage('Invalid tracing code');
            return false;
        }
    };
    const handlePost = async () => {
        try {
            const config = new ClientConfig(privateKey);
            const api = new API(config);
            const aes = new AES(await AES.convertKey(uint8ArrayToHex(tracingCode)));
            const data = Object.fromEntries(props.map(({ name, value }) => [name, value]));
            data.address = config.address;
            const {
                signature,
                recid
            } = ecdsaSign(new Uint8Array(keccak_256.update(JSON.stringify(data)).arrayBuffer()), config.privateKey);
            const c = await aes.encrypt(JSON.stringify({
                data,
                signature: uint8ArrayToHex(signature),
                recid,
            }), 'utf-8', '');
            const blockHash = hexToUint8Array(await api.getBlockHash());
            const id = hash(new Uint8Array(32).fill(0), tracingCode);
            const digest = hash(id, blockHash);
            const proof = prove(tracingCode, blockHash, digest);
            await api.setTrace(uint8ArrayToHex(id), uint8ArrayToBase64(new Uint8Array([...aes.iv, ...c])), proof);
            setMessage('提交成功');
            setProps([]);
            setStep(0);
        } catch (e) {
            setMessage(e.message);
        }
    }
    return (
        <Stepper activeStep={step} orientation='vertical' sx={{ p: 1, m: 1 }}>
            <Step>
                <StepLabel>选择身份</StepLabel>
                <StepContent>
                    <Stack spacing={1} direction='row'>
                        <TextField
                            select
                            label='我是'
                            size='small'
                            value={privateKey}
                            fullWidth
                            onChange={({ target }) => setPrivateKey(target.value)}
                        >
                            {identities.map(({ name, privateKey }) => (
                                <MenuItem key={name} value={privateKey}>
                                    {name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Button fullWidth onClick={() => setStep(1)} sx={{ flex: 0 }}>下一步</Button>
                    </Stack>
                </StepContent>
            </Step>
            <Step>
                <StepLabel>扫描溯源码</StepLabel>
                <StepContent>
                    <Scanner onData={handleData} />
                </StepContent>
            </Step>
            <Step>
                <StepLabel>数据上链</StepLabel>
                <StepContent>
                    <Stack spacing={1}>
                        <Table
                            columns={[
                                {
                                    field: 'name',
                                    headerName: '属性',
                                },
                                {
                                    field: 'value',
                                    headerName: '值',
                                },
                            ].map(({ field, headerName }) => ({
                                field,
                                headerName,
                                renderEditCell: () => (
                                    <Input
                                        name={field}
                                        label={headerName}
                                        control={control}
                                        variant='standard'
                                        fullWidth
                                        sx={{ mx: 1 }}
                                    />
                                )
                            }))}
                            rows={props}
                            title='本环节数据'
                            deleteRow={(id) => setProps(props.filter((prop) => prop.id !== id))}
                            updateRow={(id) => handleSubmit((data) => {
                                setProps((props) => [...props, { id, ...data }]);
                                handleReset();
                            })()}
                            isValid={isValid}
                            reset={handleReset}
                        />
                        <Button fullWidth disabled={!props.length} onClick={handlePost}>提交</Button>
                    </Stack>
                </StepContent>
            </Step>
            <Snackbar open={!!message} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity='info' sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </Stepper>
    );
};

const theme = responsiveFontSizes(createTheme({}));

render(<LocalizationProvider dateAdapter={AdapterDateFns}>
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
    </ThemeProvider>
</LocalizationProvider>, document.getElementById('root'));
