import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/AllRides.jsx'
import RideDetailPage from './pages/RideDetailPage'
import LandingPage from "./pages/LandingPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/all-rides" element={<HomePage />} />
        <Route path="/rides/:id" element={<RideDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
