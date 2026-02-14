export const englishToPersianDigits = (str?: string | number | null, isOmitDigits?: boolean) => {
  if (!str) {
    return '-';
  }

  const localizedString = Number(str).toLocaleString('fa-ir');

  if (isOmitDigits) {
    return localizedString.replaceAll('٬', '');
  }

  return localizedString;
};
