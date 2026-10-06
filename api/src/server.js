import { config } from './config.js';
import { createApp } from './app.js';
import { loadSeed } from './services/db.js';

await loadSeed();
const app = createApp();

app.listen(config.port, () => {
  console.log(`Dorm Parcel API พร้อมที่ http://localhost:${config.port} (${config.env})`);
  console.log(`อนุญาตให้เรียกจาก: ${config.corsOrigin}`);
});
