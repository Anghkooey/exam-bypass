// ==UserScript==
// @name          Exam Bypass Chrome
// @author        https://github.com/Anghkooey/
// @namespace     https://github.com/Anghkooey/exam-bypass-chrome
// @version       1.2.0
// @description   Prevents websites from detecting tab switches, window unfocus, and fullscreen state, and enables copying question headers on the platforma.uafm.edu.pl site for Chrome.
// @include       https://platforma.uafm.edu.pl/*
// @run-at        document-start
// ==/UserScript==

(() => {
    // Preserve original functions
    const originalRAF = window.requestAnimationFrame;
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalPerformanceNow = performance.now.bind(performance);
    const originalDateNow = Date.now;

    // Focus and visibility emulation
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
    Object.defineProperty(document, 'webkitVisibilityState', { get: () => 'visible' });
    Object.defineProperty(document, 'hidden', { get: () => false });
    document.onvisibilitychange = null;

    unsafeWindow.onblur = null;
    unsafeWindow.onfocus = null;
    unsafeWindow.document.hasFocus = () => true;

    // Fullscreen emulation
    Object.defineProperty(document, 'fullscreenElement', { get: () => document.documentElement });
    Object.defineProperty(document, 'fullscreenEnabled', { get: () => true });
    Object.defineProperty(document, 'webkitFullscreenElement', { get: () => document.documentElement });
    Object.defineProperty(document, 'mozFullScreenElement', { get: () => document.documentElement });
    Object.defineProperty(document, 'msFullscreenElement', { get: () => document.documentElement });

    // Overwrite window dimensions to mimic fullscreen
    Object.defineProperty(window, 'innerWidth', { get: () => screen.width });
    Object.defineProperty(window, 'innerHeight', { get: () => screen.height });

    // Override animation and timers
    window.requestAnimationFrame = (callback) => originalRAF(() => callback(originalPerformanceNow()));
    window.setTimeout = (callback, delay) => originalSetTimeout(() => callback(), Math.max(0, delay));
    window.setInterval = (callback, delay) => originalSetInterval(() => callback(), Math.max(0, delay));

    // Emulate user activity to prevent idle detection
    setInterval(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    }, 10000);

    // Block visibility and fullscreen-related events
    const blockedEvents = new Set([
        'visibilitychange',
        'webkitvisibilitychange',
        'blur',
        'focus',
        'fullscreenchange',
        'fullscreenerror',
    ]);

    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
        if (blockedEvents.has(type)) return;
        originalAddEventListener.call(this, type, listener, options);
    };

    // Prevent fullscreen detection via events
    blockedEvents.forEach((event) => {
        document.addEventListener(event, (e) => {
            e.stopImmediatePropagation();
            e.preventDefault();
        }, true);
    });
})();

(() => {
    // Enable copying question headers
    const enableQuestionCopying = () => {
        document.querySelectorAll('.eminus_test_question h3.eminus_test_question_details.noselect').forEach((el) => {
            el.classList.remove('noselect'); // Remove 'noselect' class
            el.style.userSelect = 'text'; // Enable text selection
        });
    };

    const startCopyingFeature = () => {
        const observer = new MutationObserver(enableQuestionCopying);
        observer.observe(document, { childList: true, subtree: true });
        enableQuestionCopying();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startCopyingFeature);
    } else {
        startCopyingFeature();
    }
})();
