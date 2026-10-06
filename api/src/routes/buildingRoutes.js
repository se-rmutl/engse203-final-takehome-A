import { Router } from 'express';
import { listBuildings } from '../services/buildingService.js';

const router = Router();

// GET /api/buildings — สาธารณะ (ไม่มีข้อมูลส่วนบุคคล)
router.get('/', (req, res) => {
  res.status(200).json(listBuildings());
});

export default router;
