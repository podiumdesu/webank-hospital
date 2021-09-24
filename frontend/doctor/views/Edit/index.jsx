import React, { useState } from 'react';
import { Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { randomHexString } from '#/utils/random';
import { Basic } from './Basic';
import { Prescription } from './Prescription';
import { Examination } from './Examination';
import { SubmissionDialog } from './SubmissionDialog';

const getDefaultValue = () => ({
    hospital: '人民医院',
    doctor: '刘伟',
    number: randomHexString(),
    name: '',
    gender: '',
    age: '',
    date: new Date(),
    cc: '',
    history: '',
    sign: '',
    diagnosis: '',
    plan: '',
});

export const Edit = () => {
    const [drugs, setDrugs] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [data, setData] = useState('');
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
        setData(JSON.stringify({ ...data, drugs, attachments }));
    };
    const onFinish = () => {
        reset(getDefaultValue());
        setData('');
        setDrugs([]);
        setAttachments([]);
    };
    return (
        <Stack spacing={1} flex="1" overflow="auto" p={1}>
            <Basic onSubmit={handleSubmit(onSubmit)} control={control} isValid={isValid} />
            <Prescription drugs={drugs} setDrugs={setDrugs} />
            <Examination attachments={attachments} setAttachments={setAttachments} />
            <SubmissionDialog open={!!data} data={data} onFinish={onFinish} />
        </Stack>
    );
};
