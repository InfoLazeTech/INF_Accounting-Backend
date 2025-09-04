require("dotenv").config();
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const KEY = Buffer.from(process.env.KEY_ENCRYPTION_SECRET || '', 'base64');
if (KEY.length !== 32) {
  console.warn('KEY_ENCRYPTION_SECRET must be base64 for 32 bytes (256 bits).');
}

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv, { authTagLength: 16 });
  let enc = cipher.update(text, 'utf8', 'base64');
  enc += cipher.final('base64');
  const tag = cipher.getAuthTag().toString('base64');
  return `${iv.toString('base64')}:${tag}:${enc}`;
}
function decrypt(payload) {
  const [iv64, tag64, data] = payload.split(':');
  const iv = Buffer.from(iv64, 'base64');
  const tag = Buffer.from(tag64, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv, { authTagLength: 16 });
  decipher.setAuthTag(tag);
  let out = decipher.update(data, 'base64', 'utf8');
  out += decipher.final('utf8');
  return out;
}
module.exports = { encrypt, decrypt };
