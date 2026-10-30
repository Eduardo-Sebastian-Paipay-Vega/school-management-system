import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import auditRoutes from './routes/audit.routes';
import usersRoutes from './routes/users.routes';
import schoolRoutes from './routes/school.routes';
import guardiansRoutes from './routes/guardians.routes';
import notificationsRoutes from './routes/notifications.routes';
import { errorHandler, notFoundHandler, OriginDeniedError } from './core/http/errors';

/** HTTP composition without database, Redis, WebSocket or worker startup. */
export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = (process.env.CORS_ORIGIN || '').split(',').map((value) => value.trim());
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new OriginDeniedError());
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(morgan('dev'));

  app.use('/api/v1', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/audit', auditRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/school', schoolRoutes);
  app.use('/api/v1/guardians', guardiansRoutes);
  app.use('/api/v1/notifications', notificationsRoutes);

  app.get('/', (_req, res) => {
    res.json({
      message: 'Sistema de Gestión Escolar — API Backend (UNSCH)',
      status: 'ONLINE',
      docs: '/api/v1/health',
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
