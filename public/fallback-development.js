/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
  var __webpack_exports__ = {};


  self.fallback = async request => {
    // https://developer.mozilla.org/en-US/docs/Web/API/RequestDestination
    switch (request.destination) {
      case 'document':
        return caches.match("/offline", { ignoreSearch: true });
      case 'image':
        return caches.match("/icon-192x192.png");
      case 'font':
        return caches.match(request.url);
      case 'script':
      case 'style':
        return caches.match(request.url);
      default:
        return fetch(request);
    }
  };
  /******/
})()
  ;