import './index.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/fira-code/400.css';
import '@fontsource/fira-code/500.css';
import '@fontsource/fira-code/600.css';
import '@fontsource/fira-code/700.css';
import {createRoot} from 'react-dom/client';
import {App} from './App.tsx';

const container = document.getElementById('root');
if (!container) throw new Error('Missing root element');
createRoot(container).render(<App />);
