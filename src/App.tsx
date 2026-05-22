import { BrowserRouter, Routes, Route } from 'react-router'
import AppLayout from '@/components/templates/AppLayout'
import Home from '@/components/pages/Home'
import About from '@/components/pages/About'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
