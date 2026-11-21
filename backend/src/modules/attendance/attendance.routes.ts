import { Router } from 'express';
import { AuthenticatedRequest, authenticateJwt } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/rbac.middleware';
import { handleError, ok, requestContext, uuidParam, validationError } from '../shared/http';
import { correctionBody } from './attendance.schemas';
import { correct } from './attendance.service';

/** M5 · paths/attendance.yaml. Montado en /api/v1/attendance. */
const router = Router();
router.use(authenticateJwt);

router.patch('/:id/correction', requirePermission('attendance:correct'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = uuidParam.safeParse(req.params.id);
      const body = correctionBody.safeParse(req.body);
      if (!id.success || !body.success) throw validationError();
      ok(res, await correct(requestContext(req), id.data, body.data));
    } catch (error) { handleError(error, res, next); }
  });

export default router;
