export function toJalali(dateString) {
  return new Date(dateString).toLocaleString('fa-IR-u-ca-persian');
}
