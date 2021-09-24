import { TextField } from '@mui/material';
import React from 'react';
import { useController } from 'react-hook-form';

export const Input = ({ control, name, rules, defaultValue, shouldUnregister, ...rest }) => {
    const {
        field: { ref, onChange, onBlur, value },
        fieldState: { invalid },
    } = useController({
        name,
        control,
        defaultValue,
        shouldUnregister,
        rules: {
            required: true,
            ...rules,
        },
    });

    return (
        <TextField
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            error={invalid}
            inputRef={ref}
            required
            size="small"
            {...rest}
        />
    );
};
