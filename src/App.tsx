import { BrowserRouter, Routes, Route } from 'react-router'
import AppLayout from '@/components/templates/AppLayout'
import Home from '@/components/pages/Home'
import UsersCreate from '@/components/pages/UsersCreate'
import UsersEdit from '@/components/pages/UsersEdit'
import Posts from '@/components/pages/Posts'
import Comments from '@/components/pages/Comments'
import About from '@/components/pages/About'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/users/new" element={<UsersCreate />} />
          <Route path="/users/:id/edit" element={<UsersEdit />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
