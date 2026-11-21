// gen.mjs — draws entry.png (1024x1024) for make.fun news-image-20261120.
// Pure Node.js standard library only. Deterministic: no randomness, no dates.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const W = 1024;
const H = 1024;
const buf = Buffer.alloc(W * H * 3);

// ---- colours ----
const NAVY = [22, 35, 63];
const INK = [26, 26, 26];
const PAPER = [246, 241, 227];
const WHITE = [255, 255, 255];
const RED = [179, 64, 46];
const BLUE = [36, 69, 122];
const TEAL = [31, 111, 107];
const AMBER = [138, 90, 0];
const PURPLE = [91, 74, 138];
const GREY = [120, 120, 110];

// ---- raster helpers ----
function px(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
}
function fillRect(x, y, w, h, c) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(i, j, c);
}
function rect(x, y, w, h, c, t = 1) {
  fillRect(x, y, w, t, c); fillRect(x, y + h - t, w, t, c);
  fillRect(x, y, t, h, c); fillRect(x + w - t, y, t, h, c);
}
function line(x0, y0, x1, y1, c, t = 1) {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, x = x0, y = y0;
  for (;;) {
    for (let a = 0; a < t; a++) for (let b = 0; b < t; b++) px(x + a, y + b, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}
function fillCircle(cx, cy, r, c) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    if (x * x + y * y <= r * r) px(cx + x, cy + y, c);
  }
}
function circle(cx, cy, r, c) {
  for (let a = 0; a < 360; a += 2) {
    const rad = (a * Math.PI) / 180;
    px(Math.round(cx + r * Math.cos(rad)), Math.round(cy + r * Math.sin(rad)), c);
  }
}
function fillPoly(points, c) {
  let minY = 1e9, maxY = -1e9;
  for (const [, y] of points) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    for (let i = 0; i < points.length; i++) {
      const [x1, y1] = points[i], [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(Math.round(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1)));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = xs[k]; x <= xs[k + 1]; x++) px(x, y, c);
    }
  }
}
function starburst(cx, cy, r, c) {
  for (let a = 0; a < 12; a++) {
    const rad = (a * Math.PI) / 6;
    line(cx, cy, Math.round(cx + r * Math.cos(rad)), Math.round(cy + r * Math.sin(rad)), c, 3);
  }
  fillCircle(cx, cy, 7, c);
}

// ---- 5x7 bitmap font ----
const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "+": ["00000", "00100", "00100", "01110", "00100", "00100", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
};
function textWidth(s, scale) { return s.length * 6 * scale - scale; }
function drawText(x, y, s, scale, c) {
  let cx = x;
  for (const ch of s) {
    const g = FONT[ch] || FONT[" "];
    for (let r = 0; r < 7; r++) for (let col = 0; col < 5; col++) {
      if (g[r][col] === "1") fillRect(cx + col * scale, y + r * scale, scale, scale, c);
    }
    cx += 6 * scale;
  }
}
function drawTextCenter(cx, y, s, scale, c) {
  drawText(cx - Math.floor(textWidth(s, scale) / 2), y, s, scale, c);
}

// ---- page ----
fillRect(0, 0, W, H, PAPER);
rect(0, 0, W, H, NAVY, 6);

// Header
fillRect(6, 6, W - 12, 126, NAVY);
drawTextCenter(512, 26, "20 NOVEMBER 2026", 5, WHITE);
drawTextCenter(512, 82, "WORLD NEWS IN ONE IMAGE", 3, [232, 196, 120]);
fillRect(312, 118, 400, 4, RED);

// ---- panels ----
function panel(x, y, w, h, title, color) {
  fillRect(x, y, w, h, WHITE);
  rect(x, y, w, h, NAVY, 3);
  fillRect(x + 3, y + 3, w - 6, 36, color);
  drawTextCenter(x + Math.floor(w / 2), y + 13, title, 2, WHITE);
  return { x, y, w, h, dx: x + 10, dy: y + 48, dw: w - 20, dh: h - 48 - 62 };
}
function caption(p, line1, line2) {
  drawTextCenter(p.x + Math.floor(p.w / 2), p.y + p.h - 50, line1, 2, INK);
  drawTextCenter(p.x + Math.floor(p.w / 2), p.y + p.h - 28, line2, 2, INK);
}

const PW = 485, PH = 318;
const p1 = panel(20, 146, PW, PH, "MISSILES FALL IN POLAND", RED);
const p2 = panel(519, 146, PW, PH, "KYIV UNDER ATTACK", BLUE);
const p3 = panel(20, 478, PW, PH, "MARKETS TUMBLE", AMBER);
const p4 = panel(519, 478, PW, PH, "RIYADH TOWER HIT", TEAL);
const p5 = panel(20, 810, 984, 194, "EARTHQUAKE IN PERU", PURPLE);

// Panel 1 — Poland: sky, land, country shape, two missile trails, impacts.
{
  const { dx, dy, dw, dh } = p1;
  fillRect(dx, dy, dw, dh, [215, 230, 242]);
  fillRect(dx, dy + Math.floor(dh * 0.62), dw, dh - Math.floor(dh * 0.62), [143, 174, 107]);
  // simplified Poland outline
  const poly = [
    [dx + 90, dy + 55], [dx + 170, dy + 40], [dx + 280, dy + 48], [dx + 360, dy + 70],
    [dx + 400, dy + 110], [dx + 370, dy + 150], [dx + 300, dy + 168], [dx + 210, dy + 160],
    [dx + 130, dy + 150], [dx + 80, dy + 110],
  ];
  fillPoly(poly, WHITE);
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
    line(x1, y1, x2, y2, RED, 3);
  }
  drawTextCenter(dx + 235, dy + 95, "POLAND", 2, RED);
  // missile trails
  line(dx + 150, dy + 8, dx + 185, dy + 118, [120, 60, 40], 3);
  line(dx + 330, dy + 8, dx + 315, dy + 128, [120, 60, 40], 3);
  fillPoly([[dx + 178, dy + 108], [dx + 192, dy + 108], [dx + 185, dy + 126]], [60, 60, 60]);
  fillPoly([[dx + 308, dy + 118], [dx + 322, dy + 118], [dx + 315, dy + 136]], [60, 60, 60]);
  starburst(dx + 185, dy + 138, 16, [255, 140, 0]);
  starburst(dx + 315, dy + 148, 16, [255, 140, 0]);
}
caption(p1, "TWO RUSSIAN MISSILES FELL IN POLAND", "POLAND: PROVOCATION; NATO: VIOLATION");

// Panel 2 — Kyiv: night sky, skyline, river, three bridges, explosions, drones.
{
  const { dx, dy, dw, dh } = p2;
  fillRect(dx, dy, dw, dh, [43, 58, 85]);
  fillCircle(dx + 400, dy + 30, 16, [240, 230, 190]);
  // skyline
  const sky = [[0, 90], [45, 70], [80, 95], [120, 60], [160, 90], [200, 75], [250, 95], [290, 65], [330, 90], [380, 70], [420, 95], [465, 80]];
  for (let i = 0; i < sky.length - 1; i++) {
    fillRect(dx + sky[i][0], dy + sky[i][1], sky[i + 1][0] - sky[i][0], dh - sky[i][1], [20, 28, 44]);
  }
  // river
  fillRect(dx, dy + 150, dw, 34, [70, 120, 170]);
  // three bridges: white deck with arch supports, explosions above
  for (const bx of [60, 190, 320]) {
    fillRect(dx + bx, dy + 164, 60, 6, [240, 240, 240]);
    line(dx + bx + 10, dy + 164, dx + bx + 30, dy + 148, [220, 220, 220], 3);
    line(dx + bx + 50, dy + 164, dx + bx + 30, dy + 148, [220, 220, 220], 3);
    line(dx + bx + 30, dy + 148, dx + bx + 30, dy + 164, [220, 220, 220], 3);
  }
  // explosions on bridges
  starburst(dx + 90, dy + 152, 18, [255, 140, 0]);
  starburst(dx + 220, dy + 152, 18, [255, 170, 30]);
  starburst(dx + 350, dy + 152, 18, [255, 140, 0]);
  // drones as small dots with trails
  for (const [qx, qy] of [[60, 30], [140, 55], [230, 25], [310, 50], [390, 40]]) {
    fillCircle(dx + qx, dy + qy, 3, [255, 220, 120]);
    line(dx + qx - 18, dy + qy + 6, dx + qx, dy + qy, [255, 220, 120], 2);
  }
  drawText(dx + 14, dy + 8, "400 DRONES, 110 MISSILES", 2, [255, 220, 120]);
}
caption(p2, "KYIV HIT: 400 DRONES, 110 MISSILES", "3 BRIDGES HIT; 3 KILLED, 15 HURT");

// Panel 3 — Markets: chart falling, red line, labels.
{
  const { dx, dy, dw, dh } = p3;
  fillRect(dx, dy, dw, dh, WHITE);
  // grid
  for (let gy = dy + 20; gy < dy + dh - 10; gy += 28) line(dx, gy, dx + dw, gy, [230, 230, 225], 1);
  for (let gx = dx + 40; gx < dx + dw; gx += 55) line(gx, dy, gx, dy + dh, [230, 230, 225], 1);
  // axes
  line(dx + 30, dy + 12, dx + 30, dy + dh - 22, INK, 3);
  line(dx + 30, dy + dh - 22, dx + dw - 8, dy + dh - 22, INK, 3);
  // falling line
  const pts = [[40, 30], [110, 45], [170, 40], [240, 75], [300, 95], [360, 130], [420, 165]];
  for (let i = 0; i < pts.length - 1; i++) {
    line(dx + pts[i][0], dy + pts[i][1], dx + pts[i + 1][0], dy + pts[i + 1][1], RED, 5);
  }
  for (const [qx, qy] of pts) fillCircle(dx + qx, dy + qy, 6, RED);
  // arrow head
  fillPoly([[dx + 420, dy + 165], [dx + 398, dy + 152], [dx + 402, dy + 172]], RED);
  drawText(dx + 150, dy + 78, "-3.7%", 3, RED);
  drawText(dx + 300, dy + 14, "NIKKEI -5.06%", 2, RED);
}
caption(p3, "S&P 500 DOWN 3.7% - IN CORRECTION", "NIKKEI DOWN 5.06%; 6TH DAY OF FALLS");

// Panel 4 — Riyadh: dusk sky, PIF tower, broken windows, missile trail.
{
  const { dx, dy, dw, dh } = p4;
  fillRect(dx, dy, dw, dh, [238, 222, 200]);
  fillCircle(dx + 60, dy + 40, 20, [250, 200, 90]);
  // city base
  fillRect(dx, dy + dh - 34, dw, 34, [120, 110, 95]);
  fillRect(dx + 20, dy + dh - 70, 70, 36, [90, 85, 80]);
  fillRect(dx + dw - 100, dy + dh - 62, 80, 28, [90, 85, 80]);
  // tower (tall, tapering top)
  const tx = dx + Math.floor(dw / 2) - 42;
  fillPoly([[tx, dy + dh - 34], [tx, dy + 22], [tx + 42, dy + 8], [tx + 84, dy + 22], [tx + 84, dy + dh - 34]], [38, 62, 96]);
  // windows
  for (let r = 0; r < 9; r++) for (let cI = 0; cI < 4; cI++) {
    const wx = tx + 12 + cI * 17, wy = dy + 34 + r * 15;
    fillRect(wx, wy, 10, 8, r >= 3 && r <= 4 ? [10, 10, 10] : [190, 210, 230]);
  }
  // missile trail
  line(dx + dw - 30, dy + 6, tx + 70, dy + 60, [200, 80, 40], 3);
  starburst(tx + 70, dy + 60, 14, [255, 140, 0]);
  drawText(dx + 14, dy + 8, "PIF TOWER", 2, INK);
}
caption(p4, "MISSILE HIT RIYADH'S TALLEST TOWER", "PIF TOWER: WINDOWS OUT, NO INJURIES");

// Panel 5 — Peru (wide): mountains, crack, shaking houses, rings, Lima arrow.
{
  const { x, y, w, h } = p5;
  const dx = x + 16, dy = y + 48, dw = 300, dh = h - 64;
  fillRect(dx, dy, dw, dh, [227, 213, 184]);
  // mountains
  fillPoly([[dx, dy + dh], [dx + 70, dy + 30], [dx + 140, dy + dh]], [150, 130, 105]);
  fillPoly([[dx + 110, dy + dh], [dx + 190, dy + 45], [dx + 270, dy + dh]], [130, 112, 88]);
  // ground crack
  const crack = [[dx + 10, dy + dh - 30], [dx + 60, dy + dh - 45], [dx + 110, dy + dh - 28], [dx + 160, dy + dh - 48], [dx + 210, dy + dh - 30], [dx + 260, dy + dh - 44], [dx + 295, dy + dh - 32]];
  for (let i = 0; i < crack.length - 1; i++) line(crack[i][0], crack[i][1], crack[i + 1][0], crack[i + 1][1], [40, 30, 25], 5);
  // shaking houses
  fillRect(dx + 30, dy + dh - 78, 44, 34, [180, 90, 60]);
  fillRect(dx + 200, dy + dh - 72, 40, 30, [90, 120, 140]);
  line(dx + 30, dy + dh - 82, dx + 52, dy + dh - 94, [180, 90, 60], 3);
  // epicentre rings
  circle(dx + 150, dy + 55, 18, RED);
  circle(dx + 150, dy + 55, 32, RED);
  circle(dx + 150, dy + 55, 46, RED);
  fillCircle(dx + 150, dy + 55, 6, RED);
  // captions on the right
  const cx0 = x + 340;
  drawText(cx0, y + 78, "STRONG QUAKE IN JUNIN,", 2, INK);
  drawText(cx0, y + 102, "CENTRAL PERU", 2, INK);
  drawText(cx0, y + 138, "FELT IN LIMA, 320 KM AWAY", 2, INK);
}

// ---- PNG encoder (own code, zlib from node:zlib) ----
const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0;
  buf.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
}
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(new URL("./entry.png", import.meta.url).pathname, png);
console.log("wrote entry.png", png.length, "bytes");
