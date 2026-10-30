import './index.css';
import '@fontsource/google-sans/400.css';
import '@fontsource/google-sans/500.css';
import '@fontsource/google-sans/600.css';
import '@fontsource/google-sans/700.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/500.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/jetbrains-mono/700.css';
import {createRoot} from 'react-dom/client';
import {App} from './App.tsx';

const container = document.getElementById('root');
if (!container) throw new Error('Missing root element');
createRoot(container).render(<App />);
