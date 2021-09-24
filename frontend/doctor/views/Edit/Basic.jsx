import { Divider, Fab, Paper, Stack, TextField, Typography } from '@mui/material';
import { Input } from '$/components/Textfields/Input';
import { Controller } from 'react-hook-form';
import { MobileDatePicker } from '@mui/lab';
import { Send } from '@mui/icons-material';
import React from 'react';

export const Basic = ({ onSubmit, control, isValid }) => {
    return (
        <Paper sx={{ p: 1 }} component="form" onSubmit={onSubmit}>
            <Typography variant="h4" gutterBottom>基本信息</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                    <Input name="hospital" label="医院" control={control} sx={{ flex: 2 }} disabled />
                    <Input name="doctor" label="医生" control={control} sx={{ flex: 1 }} disabled />
                </Stack>
                <Input name="number" label="单号" control={control} disabled />
                <Stack direction="row" spacing={2}>
                    <Input name="name" label="姓名" control={control} />
                    <Input name="gender" label="性别" control={control} />
                    <Input name="age" label="年龄" control={control} type="number" inputProps={{
                        min: 0,
                        max: 100
                    }} />
                </Stack>
                <Controller
                    name="date"
                    control={control}
                    render={({ field }) => <MobileDatePicker
                        {...field}
                        label="日期"
                        renderInput={(params) => <TextField {...params} />}
                    />}
                />
                <Input name="cc" label="主诉" control={control} multiline rows={3} />
                <Input name="history" label="既往史" control={control} multiline rows={3} />
                <Input name="sign" label="体征" control={control} multiline rows={3} />
                <Input name="diagnosis" label="诊断意见" control={control} multiline rows={3} />
                <Input name="plan" label="诊断计划" control={control} multiline rows={3} />
            </Stack>
            <Fab
                disabled={!isValid}
                variant="extended"
                size="small"
                color="primary"
                sx={{ position: 'fixed', top: 16, right: 16, zIndex: 'speedDial' }}
                type="submit"
            >
                <Send />
                提交
            </Fab>
        </Paper>
    );
};
