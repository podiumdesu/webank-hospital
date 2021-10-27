import { Divider, Box, Stack, TextField, Typography } from '@mui/material';
import { Input } from '$/components/Textfields/Input';
import { Controller } from 'react-hook-form';
import { MobileDatePicker } from '@mui/lab';
import React from 'react';

export const Basic = ({ control }) => {
    return (
        <Box>
            <Typography variant='h5' gutterBottom>基本信息</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
                <Input name='address' label='地址' control={control} disabled />
                <Input name='number' label='单号' control={control} disabled />
                <Stack direction='row' spacing={1}>
                    <Input name='hospital' label='医院' control={control} sx={{ flex: 2 }} />
                    <Input name='department' label='科室' control={control} sx={{ flex: 2 }} />
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
                <Input name='cc' label='主诉' control={control} multiline rows={3} />
                <Input name='history' label='既往史' control={control} multiline rows={3} />
                <Input name='sign' label='体征' control={control} multiline rows={3} />
                <Input name='diagnosis' label='诊断意见' control={control} multiline rows={3} />
                <Input name='plan' label='诊断计划' control={control} multiline rows={3} />
            </Stack>
        </Box>
    );
};
