import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, CssBaseline, Stack, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/lab';
import { Add, Download } from '@mui/icons-material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { EditRecord } from '$/views/EditRecord';
import { Get } from '$/views/Get';
import { EditExamination } from '$/views/EditExamination';

const theme = responsiveFontSizes(createTheme({}));

export const App = () => {
    const [value, setValue] = useState(0);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Stack height='100vh' bgcolor='#fafafa'>
                    {[<EditRecord />, <EditExamination />, <Get />][value]}
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={(_, newValue) => {
                            setValue(newValue);
                        }}
                    >
                        <BottomNavigationAction label='编写病历' icon={<Add />} />
                        <BottomNavigationAction label='编写体检报告' icon={<Add />} />
                        <BottomNavigationAction label='申请授权' icon={<Download />} />
                    </BottomNavigation>
                </Stack>
            </ThemeProvider>
        </LocalizationProvider>
    );
};
