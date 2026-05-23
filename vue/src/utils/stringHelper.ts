export const englishToPersianDigits = (
  value?: string | number | null,
): string => {
  if (value === undefined || value === null) {
    return '-';
  }

  return Number(value).toLocaleString('fa-IR');
};
