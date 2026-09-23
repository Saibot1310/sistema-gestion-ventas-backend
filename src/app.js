import express from 'express';

const app = express()

app.get('/', (req, res) => {
  res.type('text/plain').send('API del Sistema de Gestión de Ventas\nDiagnóstico: GET /health\n');
})

app.get('/health', (req, res) => {
  res.json({ estado: 'ok' });
})

export default app;