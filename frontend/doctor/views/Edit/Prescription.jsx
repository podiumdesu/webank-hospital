import { useForm } from 'react-hook-form';
import { randomHexString } from '#/utils/random';
import { IconButton, Paper, Toolbar, Typography } from '@mui/material';
import { Input } from '$/components/Textfields/Input';
import { Add, Delete, DeleteForever } from '@mui/icons-material';
import { Table } from '$/components/Table';
import React from 'react';

export const Prescription = ({ drugs, setDrugs }) => {
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
            <Table
                columns={[
                    <IconButton onClick={() => setDrugs([])}>
                        <DeleteForever />
                    </IconButton>,
                    '药品名',
                    '溯源码',
                ]}
                rows={drugs.map((drug, i) => [
                    <IconButton onClick={() => setDrugs((drugs) => drugs.filter((_, j) => i !== j))}>
                        <Delete />
                    </IconButton>,
                    ...drug
                ])}
            />
        </Paper>
    );
};
