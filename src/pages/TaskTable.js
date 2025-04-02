import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTable } from 'react-table';
import { Button, Container, Form, Table } from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSelector, useDispatch } from 'react-redux';
import { addTask, removeTask, moveTask, editTask, toggleConcluido, setCurrentTaskIndex } from '../redux/taskSlice.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck, faExclamation, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../styles/TaskTable.css';

const ITEM_TYPE = 'TASK';

function DraggableRow({ row, index, moveRow, handleRowClick }) {
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
        <td
          key={cell.column.id}
          {...cell.getCellProps()}
          className={cell.column.id === 'position' ? 'cell-position' : ''}
          onClick={cell.column.id === 'position' ? () => handleRowClick(index) : undefined}
        >
          {cell.render('Cell')}
        </td>
      ))}
    </tr>
  );
}

function EditableCell({ value: initialValue, row, column, handleEditChange }) {
  const isRunning = useSelector((state) => state.tasks.isRunning);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onChange = (e) => {
    if(isRunning) return;
    const newValue = e.target.value;
    if (
      (column.id === 'name' && newValue.length <= 30) ||
      (column.id === 'objective' && newValue.length <= 100) ||
      (column.id === 'duration' && !isNaN(newValue) && newValue >= 0 && newValue <= 999)
    ) {
      setValue(newValue);
    }
  };

  const onBlur = () => handleEditChange(row.original.position, column.id, value);

  const onKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };
 

  return (
    <Form.Control
      type={column.id === 'duration' ? 'number' : 'text'}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyPress}

    />
  );
}

export default function TaskTable() {
  const tasks = useSelector((state) => state.tasks.tasks);
  const dispatch = useDispatch();
  const isRunning = useSelector((state) => state.tasks.isRunning);

  const handleAddTask = () => dispatch(addTask());

  const handleRemoveTask = (position) => {
    if(isRunning) return;
    dispatch(removeTask(position));
  }
  const handleConcluido = (position) => {
    if(isRunning) return;
    dispatch(toggleConcluido(position));
  }

  const moveRow = (fromIndex, toIndex) => dispatch(moveTask({ fromIndex, toIndex }));

  const handleEditChange = useCallback((position, key, value) => {
    dispatch(editTask({ position, key, value }));
  }, [dispatch]);

  const handleRowClick = (index) => {
    if(isRunning) return;
    dispatch(setCurrentTaskIndex(index));
  };

  const columns = useMemo(
    () => [
      { Header: ' ', accessor: 'position' },
      { Header: 'Nome', accessor: 'name', Cell: (props) => <EditableCell {...props} handleEditChange={handleEditChange} /> },
      { Header: 'Objetivo', accessor: 'objective', Cell: (props) => <EditableCell {...props} handleEditChange={handleEditChange} /> },
      { Header: 'Duração (min)', accessor: 'duration', Cell: (props) => <EditableCell {...props} handleEditChange={handleEditChange} /> },
      {
        Header: 'Ações',
        Cell: ({ row }) => (
          <>
            <Button variant="danger" title="Excluir" className='rounded-circle' size="sm" onClick={() => handleRemoveTask(row.original.position)}>
              <FontAwesomeIcon icon={faTrash} style={{ width: "16px", height: "16px" }} />
            </Button>{' '}
            <Button className='rounded-circle' title={row.original.concluido ? 'Concluído' : 'Pendente'} variant={row.original.concluido ? 'success' : 'warning'} size="sm" onClick={() => handleConcluido(row.original.position)}>
              <FontAwesomeIcon style={{ width: "16px", height: "16px" }} icon={row.original.concluido ? faCheck : faExclamation} />
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
      <Container fluid className="p-5 text-center">
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
              return (
                <DraggableRow
                  key={row.id}
                  row={row}
                  index={index}
                  moveRow={moveRow}
                  handleRowClick={handleRowClick}
                />
              );
            })}
          </tbody>
        </Table>
        <div className="text-center" title='Adicionar linha'>
          <FontAwesomeIcon className='add-task-icon' icon={faPlus} onClick={handleAddTask} />
        </div>
      </Container>
    </DndProvider>
  );
}