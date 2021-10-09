import { useForm } from 'react-hook-form';
import { Input } from '$/components/Textfields/Input';
import { Table } from '$/components/Table';
import React from 'react';

export const Section = ({ items, setItems, title }) => {
    const {
        control,
        handleSubmit,
        reset,
        formState
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            name: '',
            result: '',
            unit: '',
            reference: '',
        }
    });
    const handleReset = () => reset({ name: '', result: '', unit: '', reference: '' });
    return (
        <Table
            columns={[
                {
                    field: 'name',
                    headerName: '项目名称',
                },
                {
                    field: 'result',
                    headerName: '结果',
                },
                {
                    field: 'reference',
                    headerName: '参考值',
                },
                {
                    field: 'unit',
                    headerName: '单位',
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
            rows={items}
            title={title}
            deleteRow={(id) => setItems(items.filter((item) => item.id !== id))}
            updateRow={(id) => handleSubmit((data) => {
                setItems((drugs) => [...drugs, { id, ...data }]);
                handleReset();
            })()}
            isValid={formState.isValid}
            reset={handleReset}
        />
    );
};
