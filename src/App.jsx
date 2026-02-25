import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Jobs from './pages/Jobs'
import Analyze from './pages/Analyze'
import Resume from './pages/Resume'
import Applications from './pages/Applications'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Proof from './pages/Proof'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="analyze" element={<Analyze />} />
        <Route path="resume" element={<Resume />} />
        <Route path="applications" element={<Applications />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="proof" element={<Proof />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
