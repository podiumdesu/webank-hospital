import { Divider, Box, Stack, TextField, Typography } from '@mui/material';
import { Input } from '$/components/Textfields/Input';
import { Controller } from 'react-hook-form';
import { MobileDatePicker } from '@mui/lab';
import React from 'react';

export const Basic = ({ control }) => {
    return (
        <Box sx={{ px: 2, py: 1 }}>
            <Typography variant='h5' gutterBottom>基本信息</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
                <Input name='address' label='地址' control={control} disabled />
                <Input name='number' label='单号' control={control} disabled />
                <Input name='project' label='项目' control={control} />
                <Stack direction='row' spacing={1}>
                    <Input name='hospital' label='机构' control={control} sx={{ flex: 2 }} />
                    <Input name='doctor' label='医生' control={control} sx={{ flex: 1 }} />
                </Stack>
                <Stack direction='row' spacing={1}>
                    <Input name='name' label='姓名' control={control} sx={{ flex: 2 }} />
                    <Input name='gender' label='性别' control={control} sx={{ flex: 1 }} />
                    <Input name='age' label='年龄' control={control} type='number' sx={{ flex: 1 }} inputProps={{ min: 0, max: 100 }} />
                </Stack>
                <Controller
                    name='time'
                    control={control}
                    render={({ field }) => <MobileDatePicker
                        {...field}
                        label='日期'
                        renderInput={(params) => <TextField {...params} size='small' />}
                    />}
                />
            </Stack>
        </Box>
    );
};
