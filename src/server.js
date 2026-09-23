import app from "./app.js";


const PORT = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`PORT inválido: ${process.env.PORT} debe ser un entero entre 1 y 65535`);
  process.exit(1);
}

const server = app.listen(PORT, (error) => {

  if (error) {
    console.error(`No se puedo escuchar en el puerto ${PORT}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  console.log(`API de ventas escuchando en http://localhost:${PORT}`);

});

function apagar(senal) {
  console.log(`\n${senal} recibida: cerrando el servidor...`);
  server.close(() => console.log('Servidor cerrado.'));
}
process.on('SIGINT', () => apagar('SIGINT'));
process.on('SIGTERM', () => apagar('SIGTERM'));