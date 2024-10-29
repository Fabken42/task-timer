import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Usaremos o localStorage
import taskReducer from './taskSlice'; // Importar o reducer das tarefas
import { combineReducers } from 'redux';

// Configurar a persistência
const persistConfig = {
    key: 'root',
    storage,
};

const rootReducer = combineReducers({
    tasks: taskReducer,
});

// Criar o persistReducer usando as configurações de persistência
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configurar a store
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Necessário para evitar erros com redux-persist
        }),
});

// Criar o persistor para usar no `PersistGate`
const persistor = persistStore(store);

export { store, persistor };
