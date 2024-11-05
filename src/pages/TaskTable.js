import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTable } from 'react-table';
import { Button, Form, Table } from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSelector, useDispatch } from 'react-redux';
import { addTask, removeTask, moveTask, editTask, toggleConcluido } from '../redux/taskSlice.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck, faExclamation } from '@fortawesome/free-solid-svg-icons';
import '../styles/TaskTable.css'; // Importa o arquivo CSS para estilos personalizados

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

  const rowClass = row.original.concluido ? 'row-concluido' : 'row-pendente';

  return (
    <tr ref={(node) => ref(drop(node))} {...row.getRowProps()} className={rowClass}>
      {row.cells.map((cell) => (
        <td key={cell.column.id} {...cell.getCellProps()}>{cell.render('Cell')}</td>
      ))}
    </tr>
  );
}

function EditableCell({ value: initialValue, row: { original }, column: { id }, handleEditChange }) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onChange = (e) => setValue(e.target.value);
  const onBlur = () => handleEditChange(original.position, id, value);

  return (
    <Form.Control
      type={id === 'duration' ? 'number' : 'text'}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}

export default function TaskTable() {
  const tasks = useSelector((state) => state.tasks.tasks);
  const dispatch = useDispatch();

  const handleAddTask = () => dispatch(addTask());
  const handleRemoveTask = (position) => dispatch(removeTask(position));
  const handleConcluido = (position) => dispatch(toggleConcluido(position));
  const moveRow = (fromIndex, toIndex) => dispatch(moveTask({ fromIndex, toIndex }));

  const handleEditChange = useCallback((position, key, value) => {
    dispatch(editTask({ position, key, value }));
  }, [dispatch]);

  const columns = useMemo(
    () => [
      { Header: 'Posição', accessor: 'position' },
      { Header: 'Nome', accessor: 'name', Cell: ({ value, row, column }) => <EditableCell value={value} row={row} column={column} handleEditChange={handleEditChange} /> },
      { Header: 'Duração (min)', accessor: 'duration', Cell: ({ value, row, column }) => <EditableCell value={value} row={row} column={column} handleEditChange={handleEditChange} /> },
      { Header: 'Objetivo', accessor: 'objective', Cell: ({ value, row, column }) => <EditableCell value={value} row={row} column={column} handleEditChange={handleEditChange} /> },
      {
        Header: 'Ações',
        Cell: ({ row }) => (
          <>
            <Button variant="danger" size="sm" onClick={() => handleRemoveTask(row.original.position)}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>{' '}
            <Button variant={row.original.concluido ? 'warning' : 'success'} size="sm" onClick={() => handleConcluido(row.original.position)}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', textAlign: 'center' }}>
                <FontAwesomeIcon icon={row.original.concluido ? faExclamation : faCheck} />
              </span>
            </Button>{' '}
          </>
        ),
      },
    ],
    [handleEditChange]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: tasks || [] });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        <h2 className="my-4">Tabela de Tarefas</h2>
        <Button className="mb-4" onClick={handleAddTask}>Adicionar Tarefa</Button>
        <Table {...getTableProps()} bordered hover>
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
              return <DraggableRow key={row.id} row={row} index={index} moveRow={moveRow} />;
            })}
          </tbody>
        </Table>
      </div>
    </DndProvider>
  );
}
