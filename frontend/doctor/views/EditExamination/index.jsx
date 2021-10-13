import React, { useState } from 'react';
import { Button, Paper, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { randomHexString } from '#/utils/random';
import { Basic } from './Basic';
import { Section } from './Section';
import { SubmissionDialog } from '$/components/SubmissionDialog';
import { Attachment } from '$/components/AttachmentTable';
import { clientConfig } from '$/config';

const getDefaultValue = () => ({
    type: 'examination',
    address: clientConfig.address,
    hospital: '',
    doctor: '',
    project: '',
    number: randomHexString(),
    name: '',
    gender: '',
    age: '',
    time: new Date(),
});

export const EditExamination = () => {
    const [general, setGeneral] = useState([]);
    const [internal, setInternal] = useState([]);
    const [surgical, setSurgical] = useState([]);
    const [cbc, setCBC] = useState([]);
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
        setData({ ...data, general, internal, surgical, cbc, attachments });
    };
    const onFinish = () => {
        reset(getDefaultValue());
        setData(undefined);
        setGeneral([]);
        setInternal([]);
        setSurgical([]);
        setCBC([]);
        setAttachments([]);
    };
    return (
        <Stack spacing={1} flex='1' overflow='auto' p={1} component='form' onSubmit={handleSubmit(onSubmit)}>
            {[
                <Basic control={control} isValid={isValid} />,
                <Section items={general} setItems={setGeneral} title='一般项目' />,
                <Section items={internal} setItems={setInternal} title='内科' />,
                <Section items={surgical} setItems={setSurgical} title='外科' />,
                <Section items={cbc} setItems={setCBC} title='血常规' />,
                <Attachment attachments={attachments} setAttachments={setAttachments} title='详细报告' />,
            ].map((element, index) => <Paper key={index}>{element}</Paper>)}
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
