import { validateParcelInput } from '../validators/parcelValidator.js';
import { listBuildingIds } from '../services/buildingService.js';

/**
 * middleware บาง ๆ — เรียก pure function แล้วตัดสินว่าจะไปต่อหรือตอบ 400
 * กฎทั้งหมดอยู่ใน validators/parcelValidator.js (ทดสอบแยกได้ด้วย unit test)
 */
export function validateParcel(req, res, next) {
  const errors = validateParcelInput(req.body, { buildingIds: listBuildingIds() });
  if (errors.length > 0) {
    return res.status(400).json({ error: 'ข้อมูลพัสดุไม่ถูกต้อง', errors });
  }
  next();
}
