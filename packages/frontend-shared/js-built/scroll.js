function getScrollContainer(el) {
  if (el == null || el.tagName === "HTML") return null;
  const overflow = window.getComputedStyle(el).getPropertyValue("overflow-y");
  if (overflow === "scroll" || overflow === "auto") {
    return el;
  } else {
    return getScrollContainer(el.parentElement);
  }
}
function getStickyTop(el, container = null, top = 0) {
  if (!el.parentElement) return top;
  const data = el.dataset.stickyContainerHeaderHeight;
  const newTop = data ? Number(data) + top : top;
  if (el === container) return newTop;
  return getStickyTop(el.parentElement, container, newTop);
}
function getStickyBottom(el, container = null, bottom = 0) {
  if (!el.parentElement) return bottom;
  const data = el.dataset.stickyContainerFooterHeight;
  const newBottom = data ? Number(data) + bottom : bottom;
  if (el === container) return newBottom;
  return getStickyBottom(el.parentElement, container, newBottom);
}
function getScrollPosition(el) {
  const container = getScrollContainer(el);
  return container == null ? window.scrollY : container.scrollTop;
}
function onScrollTop(el, cb, tolerance = 1, once = false) {
  const firstTopVisible = isTopVisible(el);
  if (el.isConnected && firstTopVisible) {
    cb(firstTopVisible);
    if (once) return null;
  }
  const container = getScrollContainer(el) ?? window;
  let prevTopVisible = firstTopVisible;
  const onScroll = () => {
    if (!document.body.contains(el)) return;
    const topVisible = isTopVisible(el, tolerance);
    if (topVisible !== prevTopVisible) {
      prevTopVisible = topVisible;
      cb(topVisible);
      if (once) removeListener();
    }
  };
  function removeListener() {
    container.removeEventListener("scroll", onScroll);
  }
  container.addEventListener("scroll", onScroll, { passive: true });
  return removeListener;
}
function onScrollBottom(el, cb, tolerance = 1, once = false) {
  const container = getScrollContainer(el);
  if (el.isConnected && isBottomVisible(el, tolerance, container)) {
    cb();
    if (once) return null;
  }
  const containerOrWindow = container ?? window;
  const onScroll = () => {
    if (!document.body.contains(el)) return;
    if (isBottomVisible(el, 1, container)) {
      cb();
      if (once) removeListener();
    }
  };
  function removeListener() {
    containerOrWindow.removeEventListener("scroll", onScroll);
  }
  containerOrWindow.addEventListener("scroll", onScroll, { passive: true });
  return removeListener;
}
function scroll(el, options) {
  const container = getScrollContainer(el);
  if (container == null) {
    window.scroll(options);
  } else {
    container.scroll(options);
  }
}
function scrollToTop(el, options = {}) {
  scroll(el, { top: 0, ...options });
}
function scrollToBottom(el, options = {}, container = getScrollContainer(el)) {
  if (container) {
    container.scroll({ top: el.scrollHeight - container.clientHeight + getStickyTop(el, container) || 0, ...options });
  } else {
    window.scroll({
      top: el.scrollHeight - window.innerHeight + getStickyTop(el, container) + (window.innerWidth <= 500 ? 96 : 0) || 0,
      ...options
    });
  }
}
function isTopVisible(el, tolerance = 1) {
  const scrollTop = getScrollPosition(el);
  if (_DEV_) console.log(scrollTop, tolerance, scrollTop <= tolerance);
  return scrollTop <= tolerance;
}
function isBottomVisible(el, tolerance = 1, container = getScrollContainer(el)) {
  if (container) return el.scrollHeight <= container.clientHeight + Math.abs(container.scrollTop) + tolerance;
  return el.scrollHeight <= window.innerHeight + window.scrollY + tolerance;
}
function getBodyScrollHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
  );
}
export {
  getBodyScrollHeight,
  getScrollContainer,
  getScrollPosition,
  getStickyBottom,
  getStickyTop,
  isBottomVisible,
  isTopVisible,
  onScrollBottom,
  onScrollTop,
  scroll,
  scrollToBottom,
  scrollToTop
};
//# sourceMappingURL=scroll.js.map
