// Usage (AFTER the site is deployed):
//   node scripts/make-qr.mjs https://qflow-8a7f2.web.app
// Creates public/qflow-qr.png - rebuild + redeploy to publish it at /qflow-qr.png
import QRCode from "qrcode";

const url = process.argv[2];
if (!url || !/^https:\/\//.test(url) || /localhost|127\.0\.0\.1/.test(url)) {
  console.error("Give the real https production URL (not localhost). Example:\n  node scripts/make-qr.mjs https://qflow-8a7f2.web.app");
  process.exit(1);
}
await QRCode.toFile("public/qflow-qr.png", url, { width: 800, margin: 2, errorCorrectionLevel: "M" });
console.log("Saved public/qflow-qr.png ->", url);
