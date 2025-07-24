import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute.jsx';
function App() {
  return (
    <>
    <Toaster position="bottom-right" reverseOrder={false} />
      <Routes>
        <Route path='/' element={<Login />} />
       <Route
          path='/Dash'
          element={
            <ProtectedRoute>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
