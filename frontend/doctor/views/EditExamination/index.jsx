import React, { useState } from 'react';
import { Button, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { randomHexString } from '#/utils/random';
import { Basic } from './Basic';
import { Section } from './Section';
import { EditStepper } from '$/components/EditStepper';
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

const ExaminationForm = ({ onUpload }) => {
    const [general, setGeneral] = useState([]);
    const [internal, setInternal] = useState([]);
    const [surgical, setSurgical] = useState([]);
    const [cbc, setCBC] = useState([]);
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
        await onUpload({ ...data, general, internal, surgical, cbc, attachments });
        reset(getDefaultValue());
        setGeneral([]);
        setInternal([]);
        setSurgical([]);
        setCBC([]);
        setAttachments([]);
    };
    return (
        <Stack spacing={1} flex='1' overflow='auto' p={1} component='form' onSubmit={handleSubmit(onSubmit)}>
            <Basic control={control} isValid={isValid} />
            <Section items={general} setItems={setGeneral} title='一般项目' />
            <Section items={internal} setItems={setInternal} title='内科' />
            <Section items={surgical} setItems={setSurgical} title='外科' />
            <Section items={cbc} setItems={setCBC} title='血常规' />
            <Attachment attachments={attachments} setAttachments={setAttachments} title='详细报告' />
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

export const EditExamination = () => <EditStepper Form={ExaminationForm} />;
