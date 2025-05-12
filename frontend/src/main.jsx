import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'mobx-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import App from './App.jsx';
import rootStore from './stores/RootStore';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider {...rootStore}>
      <App />
    </Provider>
  </StrictMode>
);
