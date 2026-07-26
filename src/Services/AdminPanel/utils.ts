export const getTimeOfDay = (): 'morning' | 'day' | 'evening' | 'night' => {
    const hours = new Date().getHours();
    if (hours < 6) {
        return 'night';
    } else if (hours < 12) {
        return 'morning';
    } else if (hours < 18) {
        return 'day';
    } else {
        return 'evening';
    }
}

export const getGradient = (timeOfDay: 'morning' | 'day' | 'evening' | 'night') => {
  switch (timeOfDay) {
    case 'morning': return 'linear-gradient(135deg, rgba(135, 206, 235, 0.8) 0%, rgba(255, 183, 94, 0.4) 50%, transparent 100%)';
    case 'day': return 'linear-gradient(135deg, rgba(74, 144, 226, 0.7) 0%, rgba(135, 206, 235, 0.3) 50%, transparent 100%)';
    case 'evening': return 'linear-gradient(135deg, rgba(44, 62, 80, 0.7) 0%, rgba(253, 116, 108, 0.4) 50%, transparent 100%)';
    case 'night': return 'linear-gradient(135deg, rgba(20, 24, 82, 0.8) 0%, rgba(43, 49, 115, 0.5) 50%, transparent 100%)';
  }
};