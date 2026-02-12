import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { MainView } from './components/MainView';
import { AdminPanel } from './components/admin/AdminPanel';
// import { useGame } from './store/GameContext';
import './App.css';
import { ThemeManager } from './components/common/ThemeManager';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  //  const { state } = useGame(); // Unused for now

  // Logic to determine if we are in Admin mode or Game mode could go here
  // For now, just rendering the Game Layout

  return (
    <>
      <ThemeManager />
      <Layout
        sidebar={<Sidebar isAdmin={isAdmin} onToggleAdmin={() => setIsAdmin(!isAdmin)} />}
        main={<MainView />}
        bottomPanel={isAdmin ? <AdminPanel /> : null}
      />
    </>
  );
};

export default App;
