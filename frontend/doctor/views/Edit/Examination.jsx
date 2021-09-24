import { useForm } from 'react-hook-form';
import { randomHexString } from '#/utils/random';
import { IconButton, Paper, Toolbar, Typography } from '@mui/material';
import { Upload } from '$/components/Textfields/Upload';
import { Add, Delete, DeleteForever } from '@mui/icons-material';
import { Table } from '$/components/Table';
import React from 'react';
import { AES } from '#/utils/aes';
import { add } from '#/utils/ipfs';

export const Examination = ({ attachments, setAttachments }) => {
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
    const onSubmit = async ({ attachment }) => {
        if (attachment?.length !== 1) {
            return;
        }
        const dk = randomHexString(64);
        const aes = new AES(await AES.convertKey(dk));
        const data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(attachment[0]);
        });
        const { cid } = await add(new Blob([aes.iv, await aes.encrypt(data, '', '')]));
        setAttachments((attachments) => [...attachments, [attachment[0].name ?? '', cid.toString(), dk]]);
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
            <Table
                columns={[
                    <IconButton onClick={() => setAttachments([])}>
                        <DeleteForever />
                    </IconButton>,
                    '附件名',
                    'CID',
                ]}
                rows={attachments.map(([name, cid], i) => [
                    <IconButton onClick={() => setAttachments((attachments) => attachments.filter((_, j) => i !== j))}>
                        <Delete />
                    </IconButton>,
                    name,
                    cid,
                ])}
            />
        </Paper>
    );
};
