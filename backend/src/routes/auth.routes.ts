import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';

const router = Router();

// Rutas públicas de autenticación
router.post('/login', requireTenant, AuthController.login);

// Rutas protegidas por JWT
router.get('/me', authenticateJwt, AuthController.me);
router.post('/logout', authenticateJwt, AuthController.logout);

export default router;
