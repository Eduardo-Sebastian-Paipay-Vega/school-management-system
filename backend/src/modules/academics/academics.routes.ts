import { Router } from 'express';
import { AuthenticatedRequest, authenticateJwt } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/rbac.middleware';
import { handleError, ok, requestContext, uuidParam, validationError } from '../shared/http';
import { enrollmentBody, guardianRecordBody, revokeBody } from './academics.schemas';
import { createEnrollment, publishGuardianRecord, revokeGuardianRecord } from './academics.service';

/** M4 · paths/enrollments.yaml. Montado en /api/v1/enrollments. */
const router = Router();
router.use(authenticateJwt);

router.post('/', requirePermission('enrollments:create'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = enrollmentBody.safeParse(req.body);
    if (!body.success) throw validationError();
    ok(res, await createEnrollment(requestContext(req), body.data), 201);
  } catch (error) { handleError(error, res, next); }
});

router.post('/guardian-records', requirePermission('guardian-records:publish'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = guardianRecordBody.safeParse(req.body);
      if (!body.success) throw validationError();
      ok(res, await publishGuardianRecord(requestContext(req), body.data), 201);
    } catch (error) { handleError(error, res, next); }
  });

router.post('/guardian-records/:id/revoke', requirePermission('guardian-records:publish'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = uuidParam.safeParse(req.params.id);
      const body = revokeBody.safeParse(req.body);
      if (!id.success || !body.success) throw validationError();
      ok(res, await revokeGuardianRecord(requestContext(req), id.data, body.data.motivo));
    } catch (error) { handleError(error, res, next); }
  });

export default router;
