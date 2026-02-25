import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Jobs from './pages/Jobs'
import AnalyzePage from './pages/AnalyzePage'
import AnalyzeResults from './pages/AnalyzeResults'
import AnalyzeHistory from './pages/AnalyzeHistory'
import ResumeLanding from './pages/ResumeLanding'
import ResumeBuilderPage from './pages/ResumeBuilderPage'
import ResumePreviewPage from './pages/ResumePreviewPage'
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
        <Route path="analyze">
          <Route index element={<AnalyzePage />} />
          <Route path="results" element={<AnalyzeResults />} />
          <Route path="history" element={<AnalyzeHistory />} />
        </Route>
        <Route path="resume">
          <Route index element={<ResumeLanding />} />
          <Route path="builder" element={<ResumeBuilderPage />} />
          <Route path="preview" element={<ResumePreviewPage />} />
        </Route>
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
