// This hook is now disabled - using CSS scroll-behavior: smooth instead
// No JavaScript scroll handling to prevent performance issues

export function useSmoothScroll() {
  // CSS handles smooth scroll via html { scroll-behavior: smooth }
  // No JS intervention needed
}

// Hook for smooth scroll to element
export function useScrollToElement() {
  const scrollToElement = (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const targetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return { scrollToElement };
}

// Smooth scroll to position function
export function smoothScrollTo(targetPosition: number) {
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

// Hook for parallax scroll effect - DISABLED
export function useParallax() {
  return { current: null };
}

// Hook for scroll progress - DISABLED  
export function useScrollProgress() {
  return { current: 0 };
}
