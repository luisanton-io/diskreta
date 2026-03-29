// import { AES, enc, SHA512 } from 'crypto-js';
import { pki } from 'node-forge';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import RecoilNexus from 'recoil-nexus';
import Dialog from './components/Dialog';
import Login from './pages/Login';
import Main from './pages/Main';
import Register from './pages/Register';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { themeState } from 'atoms/theme';
import { userState } from 'atoms/user';
import FocusHandler from 'components/FocusHandler';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import './styles/index.scss';

// (window as any).AES = AES;
// (window as any).pki = pki;
// (window as any).enc = enc;
// (window as any).SHA512 = SHA512;
// (window as any).md = md;

const Debug = () => {
  const print = useRecoilCallback(({ snapshot }) => async () => {
    console.debug('Atom values:');
    for (const node of snapshot.getNodes_UNSTABLE()) {
      const value = await snapshot.getPromise(node);
      console.debug(node.key, value);
    }
  }, []);

  const user = useRecoilValue(userState)

  const publicKey = user?.publicKey

  useEffect(() => {
    publicKey && (
      (window as any).publicKey = pki.publicKeyFromPem(publicKey)
    )
  }, [publicKey]);

  (window as any).printRecoil = print
  return null
}

function App() {

  const theme = useRecoilValue(themeState)

  useEffect(() => {
    document.querySelector("body")?.setAttribute("data-theme", theme)
  }, [theme])

  return (<>
    <RecoilNexus />
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
