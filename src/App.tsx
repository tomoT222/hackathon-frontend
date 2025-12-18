import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ItemDetail } from './pages/ItemDetail';
import { SellItemPage } from './pages/SellItemPage';
import { LoginPage } from './pages/LoginPage';
import { EditItemPage } from './pages/EditItemPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/items/:id/edit" element={<EditItemPage />} />
        <Route path="/sell" element={<SellItemPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
