import React, { useMemo, useState } from 'react';
import { render } from 'react-dom';
import {
    Alert,
    Avatar,
    Button,
    Collapse,
    CssBaseline,
    Dialog,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Snackbar,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Table as MuiTable,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ThemeProvider,
} from '@mui/material';
import { red, blue, green } from '@mui/material/colors';
import { ExpandMore, Person } from '@mui/icons-material';
import { Input } from '$/components/Textfields/Input';
import { useForm } from 'react-hook-form';
import { LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { base64ToUint8Array, hexToUint8Array, uint8ArrayToBase64, uint8ArrayToHex } from '#/utils/codec';
import { AES } from '#/utils/aes';
import { sha256 } from '#/utils/sha';
import { SecretKey, multiSigAggregate, aggregate, Signature, deserializeHexStrToPublicKey, deserializeHexStrToSignature, multiPkAggregate, multiVerify } from '#/utils/bls';
import { hash, prove } from '#/utils/rescue';
import { SimpleTable, Table } from '$/components/Table';
import { API, ClientConfig } from '#/api/v2';
import { Scanner } from '#/components/Scanner';

const getDefaultValue = () => ({
    name: '',
    value: '',
});

const identities = {
    'f7aa567e075df14664637e96de0fb3a44a77e400e1eecb3392a2055b0c190a29': {
        name: '生产商',
        color: red,
    },
    '6cc9e434e5b4ecc62c2f66deabd87487127c0a664214d14b162f39ce9e564b5e': {
        name: '运输公司',
        color: blue,
    },
    'caaad6e117b5f1ca4cfd08217a0a1343342ce96769ccaf93b9ea3c1026ceb986': {
        name: '药房',
        color: green,
    },
};

const verify = (nodes, signature, sk) => {
    if (!nodes.length || !signature.length) {
        return true;
    }
    const pks = [];
    for (let i = 1; i < nodes.length; i++) {
        pks.push(multiPkAggregate([nodes[i - 1].pk, nodes[i].pk]));
    }
    const lastNode = nodes[nodes.length - 1];
    const pk = [lastNode.pk, sk.getPublicKey()];
    pks.push(multiPkAggregate(pk));
    return multiVerify(aggregate([signature[0], multiSigAggregate([signature[1], sk.sign(lastNode.digest)], pk)]), pks, nodes.map(({ digest }) => digest));
}

const CollapsibleTable = ({ nodes }) => {
    const [open, setOpen] = useState(new Set());
    return nodes.length ? (
        <TableContainer component={Paper}>
            <MuiTable size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>节点序号</TableCell>
                        <TableCell>地址</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {nodes.map(({ data: { address, ...other } }, index) => (
                        <React.Fragment>
                            <TableRow>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => setOpen((open) => {
                                            open = new Set(open);
                                            open.has(index) ? open.delete(index) : open.add(index);
                                            return open;
                                        })}
                                    >
                                        <ExpandMore sx={{
                                            transition: (theme) => theme.transitions.create(['transform']),
                                            transform: open.has(index) ? 'rotate(180deg)' : undefined
                                        }} />
                                    </IconButton>
                                </TableCell>
                                <TableCell component="th" scope="row">{index + 1}</TableCell>
                                <TableCell>{address}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ py: 0 }} />
                                <TableCell sx={{ py: 0 }} colSpan={2}>
                                    <Collapse in={open.has(index)}>
                                        <SimpleTable columns={['属性', '值']} rows={Object.entries(other)} />
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </MuiTable>
        </TableContainer>
    ) : null;
}

const App = () => {
    const [step, setStep] = useState(0);
    const [props, setProps] = useState([]);
    const [privateKey, setPrivateKey] = useState('');
    const [tracingCode, setTracingCode] = useState();
    const [message, setMessage] = useState('');
    const [nodes, setNodes] = useState([]);
    const [signature, setSignature] = useState([]);
    const [open, setOpen] = useState(false);
    const {
        control,
        formState: { isValid },
        reset,
        handleSubmit,
    } = useForm({
        mode: 'onChange',
        defaultValues: getDefaultValue()
    });

    const sk = useMemo(() => {
        const sk = new SecretKey();
        sk.setHashOf(privateKey);
        return sk;
    }, [privateKey]);

    const config = useMemo(() => new ClientConfig(privateKey), [privateKey]);
    const api = useMemo(() => new API(config), [config]);

    const verified = useMemo(() => verify(nodes, signature, sk), [signature]);
    const lastNode = nodes[nodes.length - 1];

    const handleReset = () => reset(getDefaultValue());

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setMessage('');
    };
    const handleData = async (data) => {
        try {
            if (data.length < 32) {
                throw new Error('Invalid tracing code');
            }
            const tracingCode = data.slice(0, 32);
            setTracingCode(tracingCode);
            const id = uint8ArrayToHex(hash(new Uint8Array(32).fill(0), tracingCode));
            const trace = await api.getTraceNodes(id);
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
            setMessage(e.message);
            return false;
        }
    };
    const handlePost = async () => {
        try {
            const aes = new AES(await AES.convertKey(uint8ArrayToHex(tracingCode)));
            const data = Object.fromEntries(props.map(({ name, value }) => [name, value]));
            data.address = config.address;
            const c = new Uint8Array([...aes.iv, ...await aes.encrypt(JSON.stringify(data), 'utf-8', '')]);
            const blockHash = hexToUint8Array(await api.getBlockHash());
            const id = hash(new Uint8Array(32).fill(0), tracingCode);
            const digest = hash(id, blockHash);
            const proof = prove(tracingCode, blockHash, digest);
            await api.setTrace(
                uint8ArrayToHex(id),
                uint8ArrayToBase64(c),
                (lastNode ? multiSigAggregate([signature[1], sk.sign(lastNode.digest)], [lastNode.pk, sk.getPublicKey()]) : new Signature()).serializeToHexStr(),
                sk.sign(await sha256(c)).serializeToHexStr(),
                proof
            );
            setMessage('提交成功');
            setProps([]);
            setStep(0);
        } catch (e) {
            setMessage(e.message);
        }
    };
    return (
        <>
            <Dialog onClose={() => setOpen(false)} open={open || !privateKey} fullWidth maxWidth='xs'>
                <DialogTitle>选择身份</DialogTitle>
                <List sx={{ pt: 0 }}>
                    {Object.entries(identities).map(([privateKey, { name, color }]) => (
                        <ListItem button onClick={() => {
                            setPrivateKey(privateKey);
                            setOpen(false);
                        }} key={privateKey}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: color[100], color: color[600] }}>
                                    <Person />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={name} />
                        </ListItem>
                    ))}
                </List>
            </Dialog>
            <Snackbar open={!!message} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity='info' sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
            {privateKey && (
                <Paper sx={{ mx: 'auto', maxWidth: 800, p: 2, my: 1 }}>
                    <Alert severity='info' action={<Button onClick={() => setOpen(true)}>切换身份</Button>}>我是{identities[privateKey].name}</Alert>
                    <Stepper activeStep={step} orientation='vertical'>
                        <Step>
                            <StepLabel>扫描溯源码</StepLabel>
                            <StepContent>
                                <Scanner onData={handleData} />
                            </StepContent>
                        </Step>
                        <Step>
                            <StepLabel>供应链信息</StepLabel>
                            <StepContent>
                                <Stack spacing={1}>
                                    {
                                        lastNode ? <Alert severity={verified ? 'success' : 'error'}>验证{verified ? '成功' : '失败'}</Alert>
                                            : <Alert severity='info'>供应链空空如也</Alert>
                                    }
                                    <CollapsibleTable nodes={nodes} />
                                    <div>
                                        <Button onClick={() => setStep(0)}>完成</Button>
                                        <Button onClick={() => setStep(2)} disabled={nodes.find(({ data: { address } }) => address === config.address)}>新增节点</Button>
                                    </div>
                                </Stack>
                            </StepContent>
                        </Step>
                        <Step>
                            <StepLabel>填写信息</StepLabel>
                            <StepContent>
                                <Stack spacing={1}>
                                    <Table
                                        columns={Object.entries({ name: '属性', value: '值' }).map(([field, headerName]) => ({
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
                                    <Button disabled={!props.length} onClick={handlePost}>提交</Button>
                                </Stack>
                            </StepContent>
                        </Step>
                    </Stepper>
                </Paper>
            )}
        </>
    );
};

const theme = responsiveFontSizes(createTheme({}));

render(<LocalizationProvider dateAdapter={AdapterDateFns}>
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
    </ThemeProvider>
</LocalizationProvider>, document.getElementById('root'));
