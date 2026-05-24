export function englishToPersianDigits(value) {
  if (value === undefined || value === null) {
    return '-';
  }

  return Number(value).toLocaleString('fa-IR');
}
