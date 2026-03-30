import { pki } from 'node-forge';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Dialog from './components/Dialog';
import Login from './pages/Login';
import Main from './pages/Main';
import Register from './pages/Register';
import FocusHandler from 'components/FocusHandler';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from 'stores/auth';

const Debug = () => {
  const user = useAuthStore(s => s.user)
  const publicKey = user?.publicKey

  useEffect(() => {
    publicKey && (
      (window as any).publicKey = pki.publicKeyFromPem(publicKey)
    )
  }, [publicKey]);

  return null
}

function App() {

  const theme = useAuthStore(s => s.user?.settings.theme ?? 'dark')

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const apply = () => html.classList.toggle('dark', mq.matches)
      apply()
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    } else {
      html.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  return (<>
    <FocusHandler />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Main />} />
      <Route path="/:activeChatId" element={<Main />} />
    </Routes>
    <Dialog />
    <Debug />
    <ToastContainer position="bottom-center" theme="dark" />
  </>
  )
}

export default App;
