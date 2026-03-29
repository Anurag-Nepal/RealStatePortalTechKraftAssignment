export const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (value) => {
  if (!value) return 'N/A';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return 'Invalid time';
  return date.toLocaleTimeString('en-NP', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
