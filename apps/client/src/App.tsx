import { pki } from 'node-forge';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Dialog from './components/Dialog';
import Login from './pages/Login';
import Main from './pages/Main';
import Register from './pages/Register';
// import 'bootstrap/dist/css/bootstrap.min.css';
import FocusHandler from 'components/FocusHandler';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from 'stores/auth';
import './styles/index.scss';

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

  const theme = useAuthStore(s => s.user?.settings.theme ?? 'Default')

  useEffect(() => {
    document.querySelector("body")?.setAttribute("data-theme", theme)
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
