import * as service from '../services/parcelService.js';
import { isValidStatus, STATUSES } from '../validators/parcelValidator.js';

/** controller รู้จัก req/res และตัดสิน status code — แต่ไม่จัดการข้อมูลเอง */

const notFound = (res, id) => res.status(404).json({ error: `ไม่พบพัสดุรหัส ${id}` });

export function listParcels(req, res) {
  const { status } = req.query;
  res.status(200).json(service.findAll({ status }));
}

export function getParcel(req, res) {
  const found = service.findById(req.params.id);
  if (!found) return notFound(res, req.params.id);
  res.status(200).json(found);
}

export function createParcel(req, res) {
  const created = service.create(req.body);
  res.status(201).json(created);
}

export function updateParcelStatus(req, res) {
  const { status } = req.body ?? {};
  if (!isValidStatus(status)) {
    return res.status(400).json({ error: `สถานะต้องเป็น ${STATUSES.join(', ')}` });
  }
  const updated = service.updateStatus(req.params.id, status);
  if (!updated) return notFound(res, req.params.id);
  res.status(200).json(updated);
}

export function deleteParcel(req, res) {
  const removed = service.remove(req.params.id);
  if (!removed) return notFound(res, req.params.id);
  res.status(204).end();
}
