# ระบบรับพัสดุหอพัก (Dorm Parcel Service)

ระบบเล็ก ๆ ของสำนักงานหอพัก — **เจ้าหน้าที่**ลงทะเบียนพัสดุที่มาถึงและเปลี่ยนสถานะ · **ผู้พัก**ตรวจว่ามีพัสดุรอรับหรือไม่
React 19 + Vite · Express 5 · SQLite (`node:sqlite`) · Vitest 5 + supertest · scrypt + JWT

> โจทย์ข้อสอบอยู่ใน [`TAKEHOME_A.md`](TAKEHOME_A.md) · อาการที่ผู้ใช้แจ้งอยู่ใน [`BUG_REPORTS.md`](BUG_REPORTS.md)

## สถาปัตยกรรม

```
┌──────────────┐   HTTP + JWT   ┌───────────────────────────────┐   SQL   ┌────────────┐
│ React (Vite) │ ─────────────► │ Express API                   │ ──────► │  SQLite    │
│ frontend/    │ ◄───────────── │ route → controller → service  │ ◄────── │  parcel.db │
└──────────────┘      JSON      └───────────────────────────────┘         └────────────┘
   พอร์ต 5173                      พอร์ต 3001                               api/data/
```

## ติดตั้งและรัน (development)

ต้องใช้ **Node.js 22.13 ขึ้นไป** (`node -v`)

```bash
npm install --prefix api
npm install --prefix frontend

npm run db:setup --prefix api      # สร้าง api/data/parcel.db จาก schema.sql (ข้อมูลตั้งต้น)
npm run dev --prefix api           # API  → http://localhost:3001  (ต้องมีไฟล์ api/.env)
npm run dev --prefix frontend      # เว็บ → http://localhost:5173  (อีก terminal)
```

- ไฟล์ตั้งค่า `api/.env` — ถ้าในเครื่องยังไม่มี ให้คัดลอกจากตัวอย่าง: `cp api/.env.example api/.env` (Windows: `copy api\.env.example api\.env`)
- เริ่มข้อมูลใหม่จากข้อมูลตั้งต้น: `npm run db:reset --prefix api`

### บัญชีเจ้าหน้าที่สำหรับพัฒนา (dev เท่านั้น)

| อีเมล | รหัสผ่าน |
|---|---|
| `office@dorm.rmutl.ac.th` | `parcel1234` |

## ทดสอบ

```bash
npm test                           # api + frontend (รันทั้งคู่เสมอ แล้วสรุปท้าย)
npm test --prefix api              # เฉพาะ API
npm run test:watch --prefix api    # รันซ้ำอัตโนมัติเมื่อแก้ไฟล์
npm run coverage --prefix api      # รายงาน coverage → api/coverage/index.html
npm test --prefix frontend         # เฉพาะ pure function ฝั่ง frontend
npm run build --prefix frontend    # ตรวจว่า build ผ่าน
```

| ชุด test | ที่อยู่ |
|---|---|
| unit (pure function) | `api/tests/unit/` |
| integration (HTTP จริงผ่าน supertest · ฐานข้อมูล `:memory:`) | `api/tests/integration/` |
| helper เข้าสู่ระบบ (`STAFF` · `loginAsStaff(app)` · `tokenFor(role)`) | `api/tests/helpers/auth.js` |
| frontend (pure function · ไม่มี jsdom) | `frontend/src/**/*.test.js` |

## API

| Method | Path | สิทธิ์ | หมายเหตุ |
|---|---|---|---|
| GET | `/api/health` | สาธารณะ | สถานะระบบ + ฐานข้อมูล |
| POST | `/api/auth/login` | สาธารณะ | `{ email, password }` → `{ token, user }` |
| GET | `/api/buildings` | สาธารณะ | อาคารหอพัก |
| GET | `/api/parcels` | เจ้าหน้าที่ | รองรับ `?status=arrived\|notified\|picked-up\|returned` |
| GET | `/api/parcels/:id` | เจ้าหน้าที่ | |
| POST | `/api/parcels` | เจ้าหน้าที่ | `{ recipientName, buildingId, room, carrier, trackingNo, note? }` |
| PUT | `/api/parcels/:id` | เจ้าหน้าที่ | `{ status }` |
| DELETE | `/api/parcels/:id` | เจ้าหน้าที่ | 204 |
| GET | `/api/parcels/lookup` | สาธารณะ | **ยังไม่มี — งาน FEAT** (ดู `TAKEHOME_A.md`) |

- ส่ง token ด้วย header `Authorization: Bearer <token>` · ไม่มี/ปลอม/หมดอายุ → **401** · มี token แต่ไม่ใช่เจ้าหน้าที่ → **403**
- ข้อมูลไม่ผ่านการตรวจ → **400** `{ "error": "…", "errors": ["…", "…"] }`
- รูปแบบพัสดุ: `{ id, recipientName, buildingId, buildingName, room, carrier, trackingNo, status, arrivedAt, note }`
- สถานะ: `arrived` มาถึงแล้ว → `notified` แจ้งผู้รับแล้ว → `picked-up` รับแล้ว · หรือ `returned` ส่งคืนผู้ส่ง

## หน้าเว็บ (HashRouter)

| URL | หน้า | ใครใช้ |
|---|---|---|
| `#/` | หน้าแรก | ทุกคน |
| `#/track` | ตรวจสอบพัสดุ | ผู้พัก (**งาน FEAT**) |
| `#/login` | เข้าสู่ระบบ | เจ้าหน้าที่ |
| `#/staff/parcels` | รายการพัสดุ + ตัวกรองสถานะ | เจ้าหน้าที่ |
| `#/staff/parcels/new` | ลงทะเบียนพัสดุ | เจ้าหน้าที่ |
| `#/staff/parcels/:id` | รายละเอียด · เปลี่ยนสถานะ · ลบ | เจ้าหน้าที่ |

## โครงสร้างโฟลเดอร์

```
api/
  data/schema.sql            โครงสร้าง + ข้อมูลตั้งต้น (users · buildings · parcels)
  src/config.js              อ่าน environment variable ที่เดียว
  src/app.js                 createApp() — ประกอบ middleware และ route
  src/routes/                health · auth · buildings · parcels
  src/controllers/           รู้จัก req/res · ตัดสิน status code
  src/services/              db.js (loadSeed) · parcelService · buildingService · userService · authService
  src/middleware/            auth (authenticate/requireRole) · validateParcel · errorHandler
  src/validators/            pure function ตรวจข้อมูล
  tests/                     unit · integration · helpers
frontend/
  src/services/              apiClient (buildHeaders · apiFetch) · authStore · authService · parcelService
  src/utils/                 pure function + test
  src/pages/ · src/components/ · src/hooks/
```

## การใช้ AI

> **ต้องกรอกก่อนส่ง** — ใช้ AI ได้ แต่ต้องเปิดเผย และต้องอธิบายโค้ดที่ส่งได้ทุกบรรทัดในการสัมภาษณ์

กรอก**แยกรายคน** (1 แถวต่อคนต่อเครื่องมือ)

| ผู้ใช้ (@github) | เครื่องมือ | ใช้ทำอะไร (งานไหน) | ส่วนที่ตรวจ/แก้เอง |
|---|---|---|---|
| | (เช่น ไม่ได้ใช้ / ชื่อเครื่องมือ) | | |
| | | | |
