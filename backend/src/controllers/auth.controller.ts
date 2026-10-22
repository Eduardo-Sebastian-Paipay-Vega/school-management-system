import { Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { TenantRequest } from '../middlewares/tenant.middleware';

const loginSchema = z.object({
  username: z.string().min(3, 'El usuario o DNI debe tener al menos 3 caracteres'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
});

export class AuthController {
  static async login(req: TenantRequest, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de inicio de sesión inválidos.',
            details: parsed.error.format(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { username, password } = parsed.data;
      const tenantId = req.tenantId || 'unsch-guaman-poma-2026';
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const session = await AuthService.login(username, password, tenantId, ip, userAgent);
      if (!session) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Usuario o contraseña incorrectos.',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      const { user, accessToken, refreshToken } = session;

      // Refresh token enviado como cookie HttpOnly segura (mitigación XSS)
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      res.status(200).json({
        success: true,
        data: {
          user,
          accessToken,
          expiresIn: 900, // 15 minutos
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Error en el proceso de autenticación.',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No hay una sesión activa.',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
      timestamp: new Date().toISOString(),
    });
  }

  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.clearCookie('refreshToken');
    res.status(200).json({
      success: true,
      data: {
        message: 'Sesión cerrada exitosamente.',
      },
      timestamp: new Date().toISOString(),
    });
  }
}
