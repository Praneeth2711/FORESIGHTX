import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Landing } from './pages/Landing';
import { Workspace } from './pages/Workspace';
import { Results } from './pages/Results';
import { Compare } from './pages/Compare';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/results" element={<Results />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
