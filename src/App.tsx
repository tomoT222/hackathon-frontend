import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ItemDetail } from './pages/ItemDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items/:id" element={<ItemDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
