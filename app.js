"use strict";
(async () => {
  const chunks = [
    "./app-01.js",
    "./app-02.js",
    "./app-03.js",
    "./app-04.js",
    "./app-05.js",
    "./app-06.js",
    "./app-07.js",
    "./app-08.js",
    "./app-09.js"
  ];
  for (const src of chunks) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Dayscape runtime could not load: ${src}`));
      document.head.appendChild(script);
    });
  }
})().catch(error => console.error(error));
