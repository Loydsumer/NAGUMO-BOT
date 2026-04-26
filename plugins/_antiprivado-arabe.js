export async function before(m, { conn, isOwner, isROwner }) {
  try {
    if (m.isBaileys && m.fromMe) return true;
    if (!m.message || !m.text) return false;

    if (isOwner || isROwner) return true;

    if (!m.isGroup) {
      delete m.message;
      return false;
    }

    return true;
  } catch (e) {
    console.error('[❌ ERROR EN SISTEMA CYBERPUNK]', e);
    return true;
  }
}