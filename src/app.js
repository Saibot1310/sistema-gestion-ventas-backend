import express from 'express';

const app = express()

app.get('/health', (req, res) => {
  res.json({ estado: 'ok' });
})

export default app;