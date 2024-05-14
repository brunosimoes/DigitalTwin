import * as ReactDOMClient from "react-dom/client";
import { RegistryGraph } from "pbcRegistry/RegistryGraph";
import { useRegistry, AppWithRegistry } from "pbcRegistry/AppWithRegistry";
import React from "react";
import Stack from "@mui/material/Stack";

const App = () => {
  const registry = useRegistry();
  return <Stack style={{ width: "100%", height: "100vh" }}>
    <RegistryGraph registry={registry} />
  </Stack>;
}

const root = ReactDOMClient.createRoot(
  document.getElementById("app") as HTMLElement
);

root.render(
  <React.StrictMode>
    <React.Suspense fallback="Loading Hello World">
      <AppWithRegistry>
        <App />
      </AppWithRegistry>
    </React.Suspense>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}