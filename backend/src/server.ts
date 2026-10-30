import dotenv from 'dotenv';
import { createApp } from './app';
import { connectRedis } from './config/redis';
import { attachRealtime } from './services/realtime.service';
import { NotificationService } from './services/notifications.service';
import { assertIdentityKeys } from './core/identity-crypto';
import { assertRuntimeRole } from './config/database';

dotenv.config();

const port = process.env.PORT || 3001;

// Inicialización del Servidor
const startServer = async () => {
  assertIdentityKeys();
  await assertRuntimeRole();
  await connectRedis();
  await NotificationService.startPubsub();

  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`====================================================`);
    console.log(` Servidor Backend iniciado en http://localhost:${port}`);
    console.log(` Diagnóstico de salud en http://localhost:${port}/api/v1/health`);
    console.log(` Planteles de Aplicación "Guamán Poma de Ayala"`);
    console.log(`====================================================`);
  });
  attachRealtime(server);
  setInterval(() => {
    NotificationService.processEmailQueue().catch((error) =>
      console.error('Error al procesar la cola de correo:', error));
  }, 60_000).unref();
};

startServer().catch((err) => {
  console.error('Fallo crítico al iniciar el servidor:', err);
});
