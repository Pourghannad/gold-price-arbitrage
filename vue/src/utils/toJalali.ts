export function toJalali(dateString: string): string {
  return new Date(dateString).toLocaleString(
    'fa-IR-u-ca-persian'
  );
}
