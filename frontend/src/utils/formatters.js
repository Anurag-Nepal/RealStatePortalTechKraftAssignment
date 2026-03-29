export const formatPrice = (price) => {
  if (price == null || isNaN(price)) return 'N/A';
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};


export const formatSqft = (sqft) => {
  if (sqft == null || isNaN(sqft)) return 'N/A';
  
  return new Intl.NumberFormat('en-US').format(sqft) + ' sqft';
};


export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
};


export const formatRelativeDate = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
};


export const formatNumber = (num) => {
  if (num == null || isNaN(num)) return 'N/A';
  
  return new Intl.NumberFormat('en-US').format(num);
};


export const formatBathrooms = (bathrooms) => {
  if (bathrooms == null || isNaN(bathrooms)) return 'N/A';
  
  
  if (bathrooms % 1 === 0.5) {
    const wholeBaths = Math.floor(bathrooms);
    if (wholeBaths === 0) {
      return '½ bath';
    }
    return `${wholeBaths}½ baths`;
  }
  
  const count = Math.floor(bathrooms);
  return `${count} bath${count !== 1 ? 's' : ''}`;
};


export const formatBedrooms = (bedrooms) => {
  if (bedrooms == null || isNaN(bedrooms)) return 'N/A';
  
  const count = Math.floor(bedrooms);
  return `${count} bed${count !== 1 ? 's' : ''}`;
};


export const formatPropertyType = (type) => {
  if (!type) return 'N/A';
  
  return type.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};


export const formatCompactPrice = (price) => {
  if (price == null || isNaN(price)) return 'N/A';
  
  if (price >= 1000000) {
    const millions = (price / 1000000).toFixed(1);
    return `Rs ${millions}M`.replace('0M', 'M');
  } else if (price >= 1000) {
    const thousands = (price / 1000).toFixed(0);
    return `Rs ${thousands}K`;
  }
  
  return `Rs ${price}`;
};
