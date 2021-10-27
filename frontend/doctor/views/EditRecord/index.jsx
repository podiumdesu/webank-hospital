import React, { useState } from 'react';
import { Button, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { randomHexString } from '#/utils/random';
import { Basic } from './Basic';
import { Prescription } from './Prescription';
import { Attachment } from '$/components/AttachmentTable';
import { EditStepper } from '$/components/EditStepper';
import { clientConfig } from '$/config';

const getDefaultValue = () => ({
    type: 'record',
    address: clientConfig.address,
    hospital: '',
    department: '',
    doctor: '',
    number: randomHexString(),
    name: '',
    gender: '',
    age: '',
    time: new Date(),
    cc: '',
    history: '',
    sign: '',
    diagnosis: '',
    plan: '',
});

const RecordForm = ({ onUpload }) => {
    const [drugs, setDrugs] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const {
        control,
        formState: { isValid, isSubmitting },
        reset,
        handleSubmit,
    } = useForm({
        mode: 'onChange',
        defaultValues: getDefaultValue()
    });
    const onSubmit = async (data) => {
        data.age = +data.age;
        await onUpload({ ...data, drugs, attachments });
        reset(getDefaultValue());
        setDrugs([]);
        setAttachments([]);
    };
    return (
        <Stack spacing={1} flex='1' overflow='auto' p={1} component='form' onSubmit={handleSubmit(onSubmit)}>
            <Basic control={control} isValid={isValid} />
            <Prescription drugs={drugs} setDrugs={setDrugs} />
            <Attachment attachments={attachments} setAttachments={setAttachments} title='辅助检查' />
            <Button
                disabled={!isValid || isSubmitting}
                variant='contained'
                color='primary'
                type='submit'
                fullWidth
            >
                {isSubmitting ? '上传中' : '加密并上传'}
            </Button>
        </Stack>
    );
}

export const EditRecord = () => <EditStepper Form={RecordForm} />;
