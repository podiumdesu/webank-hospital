import { Button, Paper, Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React from 'react';
import { Add, CancelOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@mui/icons-material';
import { DataGridPro, GridActionsCellItem, GridToolbarContainer, LicenseInfo, useGridApiRef } from '@mui/x-data-grid-pro';
import { uint8ArrayToHex } from '#/utils/codec';

LicenseInfo.setLicenseKey(import.meta.env.VITE_MUI_LICENSE);

export const SimpleTable = ({ columns, rows }) => (
    <TableContainer>
        <MuiTable size='small'>
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

export const Table = ({ rows, deleteRow, columns, title, updateRow, isValid, reset }) => {
    const apiRef = useGridApiRef();
    const handleEditClick = (id) => (event) => {
        event.stopPropagation();
        apiRef.current.setRowMode(id, 'edit');
    };

    const handleSaveClick = (id) => (event) => {
        event.stopPropagation();
        apiRef.current.commitRowChange(id);
        apiRef.current.setRowMode(id, 'view');
        updateRow(id);
    };

    const handleDeleteClick = (id) => (event) => {
        event.stopPropagation();
        deleteRow(id);
    };

    const handleCancelClick = (id) => (event) => {
        event.stopPropagation();
        apiRef.current.setRowMode(id, 'view');

        const row = apiRef.current.getRow(id);
        if (row.isNew) {
            apiRef.current.updateRows([{ id, _action: 'delete' }]);
        }
        reset();
    };

    return (
        <Paper>
            <DataGridPro
                rows={rows}
                columns={columns.map((column) => ({
                    flex: 1,
                    editable: true,
                    ...column,
                })).concat({
                    field: 'actions',
                    type: 'actions',
                    headerName: '操作',
                    getActions: ({ id }) => apiRef.current.getRowMode(id) === 'edit' ? [
                        <GridActionsCellItem
                            icon={<SaveOutlined />}
                            label='Save'
                            onClick={handleSaveClick(id)}
                            color='primary'
                            disabled={!isValid}
                        />,
                        <GridActionsCellItem
                            icon={<CancelOutlined />}
                            label='Cancel'
                            onClick={handleCancelClick(id)}
                            color='primary'
                        />,
                    ] : [
                        <GridActionsCellItem
                            icon={<EditOutlined />}
                            label='Edit'
                            onClick={handleEditClick(id)}
                            color='primary'
                        />,
                        <GridActionsCellItem
                            icon={<DeleteOutlined />}
                            label='Delete'
                            onClick={handleDeleteClick(id)}
                            color='primary'
                        />,
                    ],
                })}
                apiRef={apiRef}
                editMode='row'
                onRowEditStart={(_, event) => event.defaultMuiPrevented = true}
                onRowEditStop={(_, event) => event.defaultMuiPrevented = true}
                components={{
                    Toolbar: () => (
                        <GridToolbarContainer style={{ paddingLeft: 16, paddingRight: 16 }}>
                            <Typography variant='h5' flex={1}>{title}</Typography>
                            <Button color='primary' startIcon={<Add />} onClick={() => {
                                const id = uint8ArrayToHex(crypto.getRandomValues(new Uint8Array(16)));
                                apiRef.current.updateRows([{ id, isNew: true }]);
                                apiRef.current.setRowMode(id, 'edit');
                                setTimeout(() => {
                                    apiRef.current.scrollToIndexes({
                                        rowIndex: apiRef.current.getRowsCount() - 1,
                                    });
                                });
                            }}>
                                增加
                            </Button>
                        </GridToolbarContainer>
                    ),
                    Footer: () => null
                }}
                autoHeight
                disableSelectionOnClick
            />
        </Paper>
    );
};
