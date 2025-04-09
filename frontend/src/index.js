
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './Context/authContext';
ReactDOM.createRoot(document.getElementById('root')).render(

  <AuthProvider>
    <Router>
      <ToastContainer />
      <App />
    </Router>
  </AuthProvider>
  ,
);