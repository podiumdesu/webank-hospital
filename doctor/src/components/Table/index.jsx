import { Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';

export const Table = ({ columns, rows }) => (
    <TableContainer>
        <MuiTable size="small">
            <TableHead>
                <TableRow>
                    {columns.map((column, index) => (
                        <TableCell key={index}>
                            {column}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row, index) => (
                    <TableRow hover key={index}>
                        {row.map((cell, index) => (
                            <TableCell key={index}>{cell}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </MuiTable>
    </TableContainer>
);
