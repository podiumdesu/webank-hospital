import { useForm } from 'react-hook-form';
import { Input } from '$/components/Textfields/Input';
import { Table } from '$/components/Table';
import React from 'react';

export const Prescription = ({ drugs, setDrugs }) => {
    const {
        control,
        handleSubmit,
        reset,
        formState
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            drug: '',
            quantity: '',
        }
    });
    const handleReset = () => reset({ drug: '', quantity: '' });
    return (
        <Table
            columns={[
                {
                    field: 'drug',
                    headerName: '药品名',
                },
                {
                    field: 'quantity',
                    headerName: '剂量',
                },
            ].map(({ field, headerName }) => ({
                field,
                headerName,
                renderEditCell: () => (
                    <Input
                        name={field}
                        label={headerName}
                        control={control}
                        variant='standard'
                        fullWidth
                        sx={{ mx: 1 }}
                    />
                )
            }))}
            rows={drugs}
            title='处方'
            deleteRow={(id) => setDrugs(drugs.filter((drug) => drug.id !== id))}
            updateRow={(id) => handleSubmit(({ drug, quantity }) => {
                setDrugs((drugs) => [...drugs, { id, drug, quantity }]);
                handleReset();
            })()}
            isValid={formState.isValid}
            reset={handleReset}
        />
    );
};
