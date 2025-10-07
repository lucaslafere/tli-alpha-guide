import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GuidePage from './components/GuidePage';
import GuidesListPage from './components/GuidesListPage';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <div className='app-root'>
        <Navbar />
        <main className='main-content'>
          <Routes>
            <Route path="/" element={<GuidesListPage />} />
            <Route path="/guides/:guideId" element={<GuidePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );