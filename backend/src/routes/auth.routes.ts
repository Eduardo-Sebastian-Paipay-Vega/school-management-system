import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas de autenticación
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refresh);
router.post('/forgot-password', AuthController.forgot);
router.post('/reset-password', AuthController.reset);
router.post('/activate', AuthController.activate);

// Rutas protegidas por JWT
router.get('/me', authenticateJwt, AuthController.me);
router.post('/logout', authenticateJwt, AuthController.logout);

export default router;
