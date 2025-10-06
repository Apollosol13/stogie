import { useState, useEffect } from 'react';

/**
 * Format timestamp like Instagram:
 * - "Just now" for < 1 minute
 * - "5m" for minutes
 * - "2h" for hours (up to 23h)
 * - "October 4" for > 24 hours
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffMs = now - postDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Less than 1 minute
  if (diffSeconds < 60) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }
  
  // Less than 24 hours
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  
  // More than 24 hours - show date
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const month = monthNames[postDate.getMonth()];
  const day = postDate.getDate();
  const year = postDate.getFullYear();
  const currentYear = now.getFullYear();
  
  // If same year, just show "Month Day"
  if (year === currentYear) {
    return `${month} ${day}`;
  }
  
  // If different year, show "Month Day, Year"
  return `${month} ${day}, ${year}`;
};

/**
 * Hook to update timestamp every minute
 */
export const useTimeAgo = (timestamp) => {
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(timestamp));

  useEffect(() => {
    // Update immediately
    setTimeAgo(formatTimeAgo(timestamp));

    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(timestamp));
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
};

