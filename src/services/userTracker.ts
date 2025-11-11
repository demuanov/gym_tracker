import { gymLogger } from './optimizedLogger';

// User interaction tracker for comprehensive UI logging
class UserInteractionTracker {
  private currentView = 'unknown';
  private sessionStartTime: number = Date.now();
  private pageLoadTime: number = Date.now();
  private clickEventListener?: (event: MouseEvent) => void;
  private keyboardEventListener?: (event: KeyboardEvent) => void;
  private scrollEventListener?: (event: Event) => void;
  private resizeEventListener?: (event: Event) => void;
  
  constructor() {
    this.initializeTracking();
    this.trackPageLoad();
  }

  private initializeTracking() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      gymLogger.logUserInteraction(
        document.hidden ? 'PAGE_HIDDEN' : 'PAGE_VISIBLE',
        'document',
        { 
          visibility: document.hidden ? 'hidden' : 'visible',
          timeOnPage: Date.now() - this.pageLoadTime
        }
      );
    });

    // Track beforeunload (user leaving page)
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - this.sessionStartTime;
      gymLogger.logUserInteraction(
        'SESSION_END',
        'window',
        { 
          sessionDuration,
          finalView: this.currentView,
          url: window.location.href
        }
      );
    });

    // Track page load performance
    window.addEventListener('load', () => {
      this.trackPerformanceMetrics();
    });

    // Setup comprehensive event listeners
    this.setupClickTracking();
    this.setupKeyboardTracking();
    this.setupScrollTracking();
    this.setupResizeTracking();
  }

  private trackPageLoad() {
    gymLogger.logUserInteraction(
      'PAGE_LOAD',
      'window',
      {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth
        },
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink
        } : undefined
      }
    );
  }

  private trackPerformanceMetrics() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const metrics = {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        pageLoad: timing.loadEventEnd - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnect: timing.connectEnd - timing.connectStart,
        responseTime: timing.responseEnd - timing.requestStart,
        renderTime: timing.loadEventEnd - timing.responseEnd
      };

      gymLogger.logPerformance('PAGE_LOAD_METRICS', metrics.pageLoad);
      
      Object.entries(metrics).forEach(([metric, value]) => {
        gymLogger.logPerformance(metric.toUpperCase(), value);
      });
    }

    // Track paint metrics if available
    if (window.performance && window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      paintEntries.forEach((entry: any) => {
        gymLogger.logPerformance(
          `PAINT_${entry.name.replace('-', '_').toUpperCase()}`,
          entry.startTime
        );
      });
    }
  }

  private setupClickTracking() {
    this.clickEventListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const elementInfo = this.getElementInfo(target);
      const clickDetails = {
        ...elementInfo,
        coordinates: { x: event.clientX, y: event.clientY },
        button: event.button, // 0: left, 1: middle, 2: right
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        timestamp: event.timeStamp
      };

      gymLogger.logUserInteraction('CLICK', elementInfo.type, clickDetails);

      // Special tracking for navigation elements
      if (target.matches('button, a, [role="button"]') || target.closest('button, a, [role="button"]')) {
        const actionElement = target.matches('button, a, [role="button"]') ? target : target.closest('button, a, [role="button"]') as HTMLElement;
        
        gymLogger.logUserInteraction(
          'NAVIGATION_CLICK',
          'button',
          {
            ...clickDetails,
            buttonText: actionElement.textContent?.trim(),
            buttonId: actionElement.id,
            buttonClass: actionElement.className,
            href: (actionElement as HTMLAnchorElement).href
          }
        );
      }
    };

    document.addEventListener('click', this.clickEventListener, true);
  }

  private setupKeyboardTracking() {
    this.keyboardEventListener = (event: KeyboardEvent) => {
      // Only track meaningful keyboard interactions, not every keystroke
      const trackableKeys = [
        'Enter', 'Escape', 'Tab', 'Space', 'Backspace', 'Delete',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Home', 'End', 'PageUp', 'PageDown'
      ];

      // Track keyboard shortcuts
      const isShortcut = event.ctrlKey || event.metaKey || event.altKey;
      
      if (trackableKeys.includes(event.key) || isShortcut) {
        const target = event.target as HTMLElement;
        const elementInfo = this.getElementInfo(target);

        gymLogger.logUserInteraction('KEYBOARD', elementInfo.type, {
          key: event.key,
          code: event.code,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          metaKey: event.metaKey,
          isShortcut,
          ...elementInfo
        });
      }
    };

    document.addEventListener('keydown', this.keyboardEventListener, true);
  }

  private setupScrollTracking() {
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollY = 0;

    this.scrollEventListener = (_event: Event) => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const scrollY = window.scrollY;
        const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
        const scrollPercentage = Math.round((scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        
        gymLogger.logUserInteraction('SCROLL', 'window', {
          scrollY,
          scrollDirection,
          scrollPercentage,
          scrollDistance: Math.abs(scrollY - lastScrollY)
        });

        lastScrollY = scrollY;
      }, 150); // Debounce scroll events
    };

    window.addEventListener('scroll', this.scrollEventListener, { passive: true });
  }

  private setupResizeTracking() {
    let resizeTimeout: NodeJS.Timeout;

    this.resizeEventListener = (_event: Event) => {
      clearTimeout(resizeTimeout);
      
      resizeTimeout = setTimeout(() => {
        gymLogger.logUserInteraction('WINDOW_RESIZE', 'window', {
          newSize: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        });
      }, 250); // Debounce resize events
    };

    window.addEventListener('resize', this.resizeEventListener);
  }

  private getElementInfo(element: HTMLElement) {
    return {
      type: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      text: element.textContent?.trim().substring(0, 100) || undefined, // Limit text length
      attributes: {
        type: (element as HTMLInputElement).type,
        name: (element as HTMLInputElement).name,
        placeholder: (element as HTMLInputElement).placeholder,
        role: element.getAttribute('role'),
        'aria-label': element.getAttribute('aria-label')
      },
      xpath: this.getXPath(element)
    };
  }

  private getXPath(element: HTMLElement): string {
    if (element.id) return `id("${element.id}")`;
    
    let path = '';
    let current = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `[@id="${current.id}"]`;
        path = `//${selector}${path}`;
        break;
      } else {
        const parent = current.parentNode as HTMLElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(
            child => child.tagName === current.tagName
          );
          
          if (siblings.length > 1) {
            const index = siblings.indexOf(current) + 1;
            selector += `[${index}]`;
          }
        }
        
        path = `/${selector}${path}`;
        current = parent;
      }
    }
    
    return path || '/';
  }

  // Public methods for manual tracking
  trackNavigation(from: string, to: string, method = 'programmatic') {
    const previousView = this.currentView;
    this.currentView = to;
    
    gymLogger.logNavigation(from, to, method);
    
    // Track time spent in previous view
    if (previousView !== 'unknown') {
      const timeInView = Date.now() - this.pageLoadTime;
      gymLogger.logPerformance(`TIME_IN_VIEW_${previousView.toUpperCase()}`, timeInView);
    }
    
    this.pageLoadTime = Date.now();
  }

  trackFeatureUsage(feature: string, action: string, details?: any) {
    gymLogger.logUserInteraction(`FEATURE_${action.toUpperCase()}`, feature, {
      feature,
      action,
      currentView: this.currentView,
      ...details
    });
  }

  trackFormInteraction(formName: string, action: string, fieldName?: string, details?: any) {
    gymLogger.logUserInteraction(`FORM_${action.toUpperCase()}`, formName, {
      form: formName,
      field: fieldName,
      currentView: this.currentView,
      ...details
    });
  }

  trackError(error: Error | string, context: string, details?: any) {
    gymLogger.logError(error, `USER_INTERACTION_${context}`, {
      currentView: this.currentView,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...details
    });
  }

  // Get current session info
  getSessionInfo() {
    return {
      currentView: this.currentView,
      sessionDuration: Date.now() - this.sessionStartTime,
      pageLoadTime: this.pageLoadTime,
      url: window.location.href
    };
  }

  // Clean up event listeners
  destroy() {
    if (this.clickEventListener) {
      document.removeEventListener('click', this.clickEventListener, true);
    }
    if (this.keyboardEventListener) {
      document.removeEventListener('keydown', this.keyboardEventListener, true);
    }
    if (this.scrollEventListener) {
      window.removeEventListener('scroll', this.scrollEventListener as EventListener);
    }
    if (this.resizeEventListener) {
      window.removeEventListener('resize', this.resizeEventListener);
    }
  }
}

// Export singleton instance
export const userTracker = new UserInteractionTracker();

// Export the class for manual instantiation if needed
export { UserInteractionTracker };