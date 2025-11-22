export const useHaptics = () => {
  const vibrate = (duration = 10) => {
    if (navigator.vibrate) navigator.vibrate(duration);
  };

  const tap = () => vibrate(12);
  const heavy = () => vibrate(30);

  return { tap, heavy };
};