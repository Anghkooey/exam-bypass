@echo off

:: Launch Chrome and open two tabs in the same window.
:: The first tab will navigate to the Chrome Web Store page to install Tampermonkey.
:: The second tab will navigate to the direct link to the user script for installation in Tampermonkey.

start chrome "https://chromewebstore.google.com/detail/tampermonkey-legacy/lcmhijbkigalmkeommnijlpobloojgfn" "https://github.com/Anghkooey/exam-bypass/raw/main/exam.user.js"