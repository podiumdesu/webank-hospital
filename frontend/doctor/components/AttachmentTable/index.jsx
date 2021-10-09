import { useForm } from 'react-hook-form';
import { randomHexString } from '#/utils/random';
import { Box } from '@mui/material';
import { Upload } from '$/components/Textfields/Upload';
import { Table } from '$/components/Table';
import React from 'react';
import { AES } from '#/utils/aes';
import { add } from '#/utils/ipfs';

export const Attachment = ({ attachments, setAttachments, title }) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { isValid }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            attachment: null
        }
    });
    const handleReset = () => reset({ attachment: null });
    return (
        <Table
            columns={[
                {
                    field: 'name',
                    headerName: '附件名',
                    renderEditCell: () => (
                        <Upload
                            name='attachment'
                            label='附件'
                            control={control}
                            placeholder='点击按钮选择'
                            variant='standard'
                            fullWidth
                            sx={{ mx: 1 }}
                        />
                    )
                },
                {
                    field: 'cid',
                    headerName: 'CID',
                    renderEditCell: () => <Box mx='auto'>自动填写</Box>,
                    flex: 2
                },
            ]}
            rows={attachments}
            title={title}
            deleteRow={(id) => setAttachments(attachments.filter((attachment) => attachment.id !== id))}
            updateRow={(id) => handleSubmit(async ({ attachment }) => {
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
                setAttachments((attachments) => [...attachments, { id, name: attachment[0].name ?? '', cid: cid.toString(), dk }]);
                handleReset();
            })()}
            isValid={isValid}
            reset={handleReset}
        />
    );
};
