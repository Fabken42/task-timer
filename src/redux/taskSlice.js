// features/taskSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tasks: [
        { position: 1, name: 'Tarefa 1', duration: '30', objective: 'Objetivo 1', concluido: false },
        { position: 2, name: 'Tarefa 2', duration: '30', objective: 'Objetivo 2', concluido: false },
        { position: 3, name: 'Tarefa 3', duration: '30', objective: 'Objetivo 3', concluido: false },
    ],
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        addTask: (state) => {
            const newPosition = state.tasks.length + 1;
            state.tasks.push({
                position: newPosition,
                name: `Tarefa ${newPosition}`,
                duration: '30',
                objective: `Objetivo ${newPosition}`,
                concluido: false,
            });
        },
        removeTask: (state, action) => {
            const position = action.payload;
            state.tasks = state.tasks
                .filter(task => task.position !== position)
                .map(task => (task.position > position ? { ...task, position: task.position - 1 } : task));
        },
        moveTask: (state, action) => {
            console.log('movendo task');

            const { fromIndex, toIndex } = action.payload;
            const [movedTask] = state.tasks.splice(fromIndex, 1);
            state.tasks.splice(toIndex, 0, movedTask);
            state.tasks = state.tasks.map((task, index) => ({ ...task, position: index + 1 }));
        },
        editTask: (state, action) => {
            const { position, key, value } = action.payload;
            const taskIndex = state.tasks.findIndex((task) => task.position === position);
            if (taskIndex !== -1) {
                state.tasks[taskIndex][key] = value;
            }
        },
        toggleConcluido: (state, action) => {
            const position = action.payload;
            const task = state.tasks.find(task => task.position === position);
            if (task) task.concluido = !task.concluido;
        },
        togglePendencia: (state, action) => {
            const position = action.payload;
            const task = state.tasks.find(task => task.position === position);
            if (task) task.concluido = false;
        },
    },
});

export const { addTask, removeTask, moveTask, editTask, toggleConcluido, togglePendencia } = taskSlice.actions;
export default taskSlice.reducer;