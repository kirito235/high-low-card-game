import { GoogleOAuthProvider } from '@react-oauth/google';
import GameBoard from './components/GameBoard';
import './App.css';
import Login from './pages/login';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from './pages/signup';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;


function App() {
  return (
        <div className="App">
      <GoogleOAuthProvider clientId={clientId}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/game" element={<GameBoard />} />
            {/* redirect root ("/") to login by default */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;