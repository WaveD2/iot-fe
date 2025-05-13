import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import Loading from './components/Loading'
import Auth from './pages/Auth'
import ProtectedRoute from './router/Protected'
import Error from './pages/Error'
import Dashboard from './pages/Chart'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path='/auth' element={<Auth />} />
          <Route path='/auth/forgot-password' element={<ForgotPassword />} />
          <Route path='/' element={<ProtectedRoute />}>
            <Route path='/' element={<Dashboard />}></Route>
          </Route>
          <Route path='*' element={<Error />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
