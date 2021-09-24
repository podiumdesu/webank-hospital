import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import React from 'react';
import { useController } from 'react-hook-form';

export const Upload = ({ control, name, rules, defaultValue, shouldUnregister, ...rest }) => {
    const {
        field: { ref, onChange, onBlur, value },
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
            required
            InputProps={{
                readOnly: true,
                endAdornment: (
                    <InputAdornment position="end">
                        <label htmlFor="file">
                            <input
                                ref={ref}
                                id="file"
                                onChange={(e) => onChange(e.target.files)}
                                onBlur={onBlur}
                                type="file"
                                hidden
                            />
                            <IconButton component="span" size={rest.size}>
                                <UploadIcon />
                            </IconButton>
                        </label>
                    </InputAdornment>
                ),
                ...rest.InputProps,
            }}
            size="small"
            {...rest}
            value={value?.[0]?.name ?? rest.value ?? ''}
        />
    );
};
