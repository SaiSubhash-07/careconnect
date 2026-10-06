// Standard 12-Hour US & Canada Time Formatter (e.g. 10:15:30 PM)
export const formatUS12HourTime = (date = new Date(), includeSeconds = true) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: true
  });
};

// Check if a scheduled 12-hour AM/PM time has been crossed today
export const isTimeCrossed = (timeStr) => {
  if (!timeStr) return false;
  try {
    const now = new Date();
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!match) return false;

    let [, hoursStr, minsStr, modifier] = match;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minsStr, 10);

    if (modifier) {
      const mod = modifier.toUpperCase();
      if (mod === 'PM' && hours < 12) hours += 12;
      if (mod === 'AM' && hours === 12) hours = 0;
    }

    const medDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    return now.getTime() >= medDate.getTime();
  } catch {
    return false;
  }
};

// Calculate how many minutes overdue a scheduled medicine is
export const getMinutesOverdue = (timeStr) => {
  if (!timeStr) return 0;
  try {
    const now = new Date();
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!match) return 0;

    let [, hoursStr, minsStr, modifier] = match;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minsStr, 10);

    if (modifier) {
      const mod = modifier.toUpperCase();
      if (mod === 'PM' && hours < 12) hours += 12;
      if (mod === 'AM' && hours === 12) hours = 0;
    }

    const medDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    const diffMs = now.getTime() - medDate.getTime();
    if (diffMs <= 0) return 0;
    return Math.floor(diffMs / (1000 * 60));
  } catch {
    return 0;
  }
};
