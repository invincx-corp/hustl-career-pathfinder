import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/api-status' // Check API status on startup

createRoot(document.getElementById("root")!).render(<App />);
