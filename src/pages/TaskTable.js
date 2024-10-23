import React, { useState, useCallback, useMemo } from 'react';
import { useTable } from 'react-table';
import { Button, Form, Table } from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ITEM_TYPE = 'TASK';

function DraggableRow({ row, index, moveRow }) {
    const [, ref] = useDrag({
        type: ITEM_TYPE,
        item: { index },
    });

    const [, drop] = useDrop({
        accept: ITEM_TYPE,
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveRow(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    return (
        <tr ref={(node) => ref(drop(node))} {...row.getRowProps()}>
            {row.cells.map((cell) => (
                <td key={cell.column.id} {...cell.getCellProps()}>{cell.render('Cell')}</td>
            ))}
        </tr>
    );
}

function EditableCell({ value: initialValue, row: { original }, column: { id }, handleEditChange }) {
    // Gerenciar valor temporário no input
    const [value, setValue] = useState(initialValue);

    const onChange = (e) => {
        setValue(e.target.value);  // Atualiza apenas localmente
    };

    const onBlur = () => {
        handleEditChange(original.position, id, value);  // Atualiza o estado global ao perder o foco
    };

    return (
        <Form.Control
            type={id === 'duration' ? 'number' : 'text'}
            value={value}
            onChange={onChange}
            onBlur={onBlur}  // Só atualiza no `onBlur`
        />
    );
}

export default function TaskTable() {
    const [tasks, setTasks] = useState([
        { position: 1, name: 'Tarefa 1', duration: '30', objective: 'Objetivo 1' },
        { position: 2, name: 'Tarefa 2', duration: '30', objective: 'Objetivo 2' },
        { position: 3, name: 'Tarefa 3', duration: '30', objective: 'Objetivo 3' },
    ]);

    const handleAddTask = () => {
        const newPosition = tasks.length + 1;
        setTasks([
            ...tasks,
            {
                position: newPosition,
                name: `Tarefa ${newPosition}`,
                duration: '30',
                objective: `Objetivo ${newPosition}`,
            },
        ]);
    };

    const handleRemoveTask = (position) => {
        setTasks(tasks
            .filter(task => task.position !== position)
            .map(task => task.position > position ? { ...task, position: task.position - 1 } : task)
        );
    };

    const moveRow = (fromIndex, toIndex) => {
        const updatedTasks = [...tasks];
        const [movedTask] = updatedTasks.splice(fromIndex, 1);
        updatedTasks.splice(toIndex, 0, movedTask);
        setTasks(updatedTasks.map((task, index) => ({ ...task, position: index + 1 })));
    };

    const handleEditChange = useCallback((position, key, value) => {
        const updatedTasks = tasks.map((task) =>
            task.position === position ? { ...task, [key]: value } : task
        );
        setTasks(updatedTasks);
    }, [tasks]);

    const columns = useMemo(
        () => [
            {
                Header: 'Posição',
                accessor: 'position',
            },
            {
                Header: 'Nome',
                accessor: 'name',
                Cell: ({ value, row, column }) => (
                    <EditableCell
                        value={value}
                        row={row}
                        column={column}
                        handleEditChange={handleEditChange}
                    />
                ),
            },
            {
                Header: 'Duração (min)',
                accessor: 'duration',
                Cell: ({ value, row, column }) => (
                    <EditableCell
                        value={value}
                        row={row}
                        column={column}
                        handleEditChange={handleEditChange}
                    />
                ),
            },
            {
                Header: 'Objetivo',
                accessor: 'objective',
                Cell: ({ value, row, column }) => (
                    <EditableCell
                        value={value}
                        row={row}
                        column={column}
                        handleEditChange={handleEditChange}
                    />
                ),
            },
            {
                Header: 'Ações',
                Cell: ({ row }) => (
                    <div className="d-flex justify-content-around">
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveTask(row.original.position)}
                        >
                            Remover
                        </Button>
                    </div>
                ),
            },
        ],
        [tasks, handleEditChange]
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
        columns,
        data: tasks,
    });

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="container">
                <button onClick={() => console.log(tasks)}>debug</button>
                <h2 className="my-4">Tabela de Tarefas</h2>
                <Button className="mb-4" onClick={handleAddTask}>
                    Adicionar Tarefa
                </Button>
                <Table {...getTableProps()} striped bordered hover>
                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column) => (
                                    <th key={column.id} {...column.getHeaderProps()}>{column.render('Header')}</th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map((row, index) => {
                            prepareRow(row);
                            return (
                                <DraggableRow key={row.id} row={row} index={index} moveRow={moveRow} />
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        </DndProvider>
    );
}
