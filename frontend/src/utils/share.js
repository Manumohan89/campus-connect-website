/**
 * share.js — Shareable links for WhatsApp, copy, and native share
 */
const APP_URL = window.location.origin;

export function shareOnWhatsApp(text, url = '') {
  const msg = encodeURIComponent(url ? `${text}\n${url}` : text);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

export function shareCertificate(certId, courseName) {
  const url = `${APP_URL}/certificate/${certId}`;
  const text = `🎓 I just completed "${courseName}" on Campus Connect and earned a certificate!\nVerify at: ${url}`;
  shareOnWhatsApp(text, '');
}

export function shareResult(usn, sgpa) {
  const text = `📊 My VTU Result: USN ${usn} — SGPA: ${sgpa}\nCheck yours at Campus Connect: ${APP_URL}/vtu-result`;
  shareOnWhatsApp(text, '');
}

export function sharePlacement(companyName, role) {
  const text = `🏢 New placement drive: ${companyName} is hiring for ${role}!\nCheck eligibility & apply on Campus Connect: ${APP_URL}/placement-drives`;
  shareOnWhatsApp(text, '');
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}
