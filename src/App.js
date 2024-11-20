import React from 'react';
import TaskTable from './pages/TaskTable.js';
import TaskTimer from './pages/TaskTimer.js';
import Header from './pages/Header.js';
import Footer from './pages/Footer.js';

export default function App() {
  return (
    <>
      <div className='content'>
        <Header />
        <TaskTimer />
        <TaskTable />
      </div>
      <Footer />
    </>
  );
}