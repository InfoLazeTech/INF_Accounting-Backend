const { decrypt } = require("./utils/crypto");

// 🔐 Paste encrypted key
const encryptedKey = "w8vkKUjpV5sxxuUB:EN9kXuNDjEwx7Hm3NUBH4g==:Bejeq2JBP8Y5yZlOylC0futFn7Ih0b48jnUwtug+YogCIrt/HISc2bCmwDtKvoDJwhANB03BPFmlgb/+Chf8WdEZ";

try {
  const decrypted = decrypt(encryptedKey);
  console.log("✅ Decrypted Private Key:", decrypted);
} catch (err) {
  console.error("❌ Failed:", err.message);
}
