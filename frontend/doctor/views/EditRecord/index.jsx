import React, { useState } from 'react';
import { Button, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { randomHexString } from '#/utils/random';
import { Basic } from './Basic';
import { Prescription } from './Prescription';
import { Attachment } from './Attachment';
import { SubmissionDialog } from '$/components/SubmissionDialog';
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

export const EditRecord = () => {
    const [drugs, setDrugs] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [data, setData] = useState(undefined);
    const {
        control,
        formState: { isValid },
        reset,
        handleSubmit,
    } = useForm({
        mode: 'onChange',
        defaultValues: getDefaultValue()
    });
    const onSubmit = (data) => {
        data.age = +data.age;
        setData({ ...data, drugs, attachments });
    };
    const onFinish = () => {
        reset(getDefaultValue());
        setData(undefined);
        setDrugs([]);
        setAttachments([]);
    };
    return (
        <Stack spacing={1} flex='1' overflow='auto' p={1} component='form' onSubmit={handleSubmit(onSubmit)}>
            <Basic control={control} isValid={isValid} />
            <Prescription drugs={drugs} setDrugs={setDrugs} />
            <Attachment attachments={attachments} setAttachments={setAttachments} />
            <SubmissionDialog open={!!data} data={data} onFinish={onFinish} />
            <Button
                disabled={!isValid}
                variant='contained'
                color='primary'
                type='submit'
                fullWidth
            >
                提交
            </Button>
        </Stack>
    );
};
