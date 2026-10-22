import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import auditRoutes from './routes/audit.routes';
import { connectRedis } from './config/redis';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares de Seguridad y Registro
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origen (Postman/Curl) y orígenes configurados
      if (!origin) return callback(null, true);
      const allowed = (process.env.CORS_ORIGIN || '').split(',');
      if (allowed.some((pattern) => origin.includes(pattern.trim()))) {
        return callback(null, true);
      }
      return callback(null, true); // Permisivo en desarrollo
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rutas Base y Core del Sistema
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/audit', auditRoutes);

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
  await connectRedis();

  app.listen(port, () => {
    console.log(`====================================================`);
    console.log(` Servidor Backend iniciado en http://localhost:${port}`);
    console.log(` Diagnóstico de salud en http://localhost:${port}/api/v1/health`);
    console.log(` Planteles de Aplicación "Guamán Poma de Ayala"`);
    console.log(`====================================================`);
  });
};

startServer().catch((err) => {
  console.error('Fallo crítico al iniciar el servidor:', err);
});

export default app;
