import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./adapters/ui/components/Layout"
import { RoutesPage } from "./adapters/ui/pages/Routes"
import { ComparePage } from "./adapters/ui/pages/Compare"
import { BankingPage } from "./adapters/ui/pages/Banking"
import { PoolingPage } from "./adapters/ui/pages/Pooling"

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/routes" replace />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/banking" element={<BankingPage />} />
        <Route path="/pooling" element={<PoolingPage />} />
      </Routes>
    </Layout>
  )
}

export default App
