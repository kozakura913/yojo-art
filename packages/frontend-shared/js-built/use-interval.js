import { onActivated, onDeactivated, onMounted, onUnmounted } from "vue";
function useInterval(fn, interval, options) {
  if (Number.isNaN(interval)) return;
  let intervalId = null;
  if (options.afterMounted) {
    onMounted(() => {
      if (options.immediate) fn();
      intervalId = window.setInterval(fn, interval);
    });
  } else {
    if (options.immediate) fn();
    intervalId = window.setInterval(fn, interval);
  }
  const clear = () => {
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;
  };
  onActivated(() => {
    if (intervalId) return;
    if (options.immediate) fn();
    intervalId = window.setInterval(fn, interval);
  });
  onDeactivated(() => {
    clear();
  });
  onUnmounted(() => {
    clear();
  });
  return clear;
}
export {
  useInterval
};
//# sourceMappingURL=use-interval.js.map
