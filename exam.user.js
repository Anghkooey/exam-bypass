// ==UserScript==
// @name          Exam Bypass
// @author        https://github.com/Anghkooey/
// @namespace     https://github.com/Anghkooey/exam-bypass
// @version       1.0.0
// @description   Prevents websites from detecting tab switches or window unfocus and enables copying question headers on the platforma.uafm.edu.pl site.
// @include       https://platforma.uafm.edu.pl/*
// @run-at        document-start
// ==/UserScript==

(() => {
    // **Focus Mode Bypass: Run Early at document-start**
    const originalRAF = window.requestAnimationFrame;
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalPerformanceNow = performance.now.bind(performance);
    const originalDateNow = Date.now;
    const originalAddEventListener = window.addEventListener;
    const originalDocumentAddEventListener = document.addEventListener;

    let timeOffset = 0;

    // Emulate constant visibility state
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
    Object.defineProperty(document, 'webkitVisibilityState', { get: () => 'visible' });
    Object.defineProperty(document, 'hidden', { get: () => false });
    document.onvisibilitychange = null;

    // Emulate focus state
    unsafeWindow.onblur = null;
    unsafeWindow.onfocus = null;
    unsafeWindow.document.hasFocus = () => true;

    // Override requestAnimationFrame
    window.requestAnimationFrame = (callback) => originalRAF(() => {
        try { callback(originalPerformanceNow()); } catch (e) {}
    });

    // Adjust timers
    window.setTimeout = (callback, delay) => originalSetTimeout(() => {
        try { callback(); } catch (e) {}
    }, Math.max(0, delay));

    window.setInterval = (callback, delay) => originalSetInterval(() => {
        try { callback(); } catch (e) {}
    }, Math.max(0, delay));

    // Offset time
    setInterval(() => {
        timeOffset += 10; // Increment time offset periodically
    }, 100);

    performance.now = () => originalPerformanceNow() + timeOffset;
    Date.now = () => originalDateNow() + timeOffset;

    // Prevent visibility-related events
    const blockedEvents = new Set([
        'visibilitychange',
        'webkitvisibilitychange',
        'blur',
        'focus',
        'mouseleave',
        'mouseout',
    ]);

    window.addEventListener = new Proxy(window.addEventListener, {
        apply(target, thisArg, args) {
            if (blockedEvents.has(args[0])) return;
            return originalAddEventListener.apply(thisArg, args);
        },
    });

    document.addEventListener = new Proxy(document.addEventListener, {
        apply(target, thisArg, args) {
            if (blockedEvents.has(args[0])) return;
            return originalDocumentAddEventListener.apply(thisArg, args);
        },
    });
})();

(() => {
    // **Enable Copying for Question Headers: Run Later at document-end**
    const enableQuestionCopying = () => {
        document.querySelectorAll('.eminus_test_question h3.eminus_test_question_details.noselect').forEach((el) => {
            el.classList.remove('noselect'); // Remove 'noselect' class
            el.style.userSelect = 'text'; // Enable text selection
        });
    };

    const startCopyingFeature = () => {
        // Observe DOM changes for dynamically loaded content
        const observer = new MutationObserver(enableQuestionCopying);
        observer.observe(document, { childList: true, subtree: true });

        // Initial activation
        enableQuestionCopying();
    };

    // Run copying feature after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startCopyingFeature);
    } else {
        startCopyingFeature();
    }
})();
