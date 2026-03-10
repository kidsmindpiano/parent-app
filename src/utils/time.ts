// Convert Korean time string (e.g. "7:45") to local time using 시차
export function toLocalTime(koreanTime: string, timeDiff: number): string {
  if (!koreanTime) return '';
  const parts = koreanTime.split(':');
  if (parts.length < 2) return koreanTime;
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return koreanTime;
  
  hours += timeDiff;
  
  // Handle day wrap
  if (hours < 0) hours += 24;
  if (hours >= 24) hours -= 24;
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

export function getTimeDiff(student: { 시차?: string; 시차기본?: string }): number {
  const raw = student.시차?.trim() || student.시차기본?.trim() || '0';
  const num = parseInt(raw, 10);
  return isNaN(num) ? 0 : num;
}
