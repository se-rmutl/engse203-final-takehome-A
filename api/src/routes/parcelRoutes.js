import { Router } from 'express';
import * as controller from '../controllers/parcelController.js';
import { validateParcel } from '../middleware/validateParcel.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, requireRole('staff'), controller.listParcels);
router.post('/', authenticate, requireRole('staff'), validateParcel, controller.createParcel);
router.get('/:id', authenticate, requireRole('staff'), controller.getParcel);
router.put('/:id', authenticate, requireRole('staff'), controller.updateParcelStatus);
router.delete('/:id', controller.deleteParcel);

export default router;
