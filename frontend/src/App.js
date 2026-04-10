import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Meetings from './pages/Meetings';
import MeetingDetail from './pages/MeetingDetail';
import ActionItems from './pages/ActionItems.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/action-items" element={<ActionItems />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;