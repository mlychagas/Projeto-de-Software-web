export const dateFormat = (
    value: string | Date | number | null | undefined,
    options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
    locale = 'pt-BR',
    withTime = false,
  ): string => {
    if (value === null || value === undefined) return '';
  
    const date = value instanceof Date ? value : new Date(value);
  
    if (isNaN(date.getTime())) return '';
  
    const resolvedOptions: Intl.DateTimeFormatOptions = withTime
      ? { ...options, hour: '2-digit', minute: '2-digit' }
      : options;
  
    return date.toLocaleDateString(locale, resolvedOptions);
  };