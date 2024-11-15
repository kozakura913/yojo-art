import { onMounted, onUnmounted, ref } from "vue";
function useDocumentVisibility() {
  const visibility = ref(document.visibilityState);
  const onChange = () => {
    visibility.value = document.visibilityState;
  };
  onMounted(() => {
    document.addEventListener("visibilitychange", onChange);
  });
  onUnmounted(() => {
    document.removeEventListener("visibilitychange", onChange);
  });
  return visibility;
}
export {
  useDocumentVisibility
};
//# sourceMappingURL=use-document-visibility.js.map
