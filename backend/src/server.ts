import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import auditRoutes from './routes/audit.routes';
import usersRoutes from './routes/users.routes';
import schoolRoutes from './routes/school.routes';
import guardiansRoutes from './routes/guardians.routes';
import notificationsRoutes from './routes/notifications.routes';
import { connectRedis } from './config/redis';
import { attachRealtime } from './services/realtime.service';
import { NotificationService } from './services/notifications.service';
import { assertIdentityKeys } from './core/identity-crypto';
import { assertRuntimeRole } from './config/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares de Seguridad y Registro
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = (process.env.CORS_ORIGIN || '').split(',').map((value) => value.trim());
      if (allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rutas Base y Core del Sistema
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/school', schoolRoutes);
app.use('/api/v1/guardians', guardiansRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

// Ruta Raíz
app.get('/', (_req, res) => {
  res.json({
    message: 'Sistema de Gestión Escolar — API Backend (UNSCH)',
    status: 'ONLINE',
    docs: '/api/v1/health',
  });
});

// Inicialización del Servidor
const startServer = async () => {
  assertIdentityKeys();
  await assertRuntimeRole();
  await connectRedis();
  await NotificationService.startPubsub();

  const server=app.listen(port, () => {
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
  },60_000).unref();
};

startServer().catch((err) => {
  console.error('Fallo crítico al iniciar el servidor:', err);
});

export default app;
