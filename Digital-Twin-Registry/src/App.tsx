import * as ReactDOM from "react-dom/client";
import JSONValidator from "@components/registry/JSONValidator";
import LoadingPage from "@components/spinners/LoadingPage";
import React, { useEffect, useState } from "react";
import RegistryEditor from "@components/registry/RegistryEditor";
import { getRegistry, getRegistryBaseURL, Registry } from "@definitions/RegistryDefinition";
import { NavigationControls } from "@components/registry/NavigationControls";
import { RegistryGraph } from "@components/map/RegistryGraph";
import { Stack } from "@mui/material";
import "./index.scss";

const App = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isValidateDialogOpen, setValidateDialogOpen] = useState(false);
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleValidateDialogOpen = () => {
    setValidateDialogOpen(true);
  };

  const postToEndpoint = async (endpoint: string, data: any) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to post to ${endpoint}: ${response.statusText}`);
    }

    return response.json();
  };

  const handleUpdateRegistry = async (reg: Registry) => {
    try {
      if (!registry) return;

      if (JSON.stringify(reg.app) !== JSON.stringify(registry.app)) {
        const endpoint = `${getRegistryBaseURL()}/app`;
        await postToEndpoint(endpoint, reg.app);
        console.log("registry app updated", reg.app);
      }

      if (JSON.stringify(reg.modules) !== JSON.stringify(registry.modules)) {
        const endpoint = `${getRegistryBaseURL()}/modules`;
        await postToEndpoint(endpoint, reg.modules);
        console.log("registry modules updated", reg.modules);
      }

      if (JSON.stringify(reg.config) !== JSON.stringify(registry.config)) {
        const endpoint = `${getRegistryBaseURL()}/config`;
        await postToEndpoint(endpoint, reg.config);
        console.log("registry config updated", reg.config);
      }

      setRegistry(reg);
    } catch (error) {
      console.error("Error updating registry:", error);
    }
  };

  useEffect(() => {
    getRegistry().then((registry) => {
      if (registry) {
        setRegistry(registry);
      } else {
        setError(
          "Apologies, we encountered a hiccup while fetching the registry data. Please check your internet connection and try again later.",
        );
      }
    });
  }, []);

  if (!registry) {
    return <LoadingPage hideSpinner={error !== null} text={error ?? undefined} />;
  }

  return (
    <Stack style={{ width: "100%", height: "100vh" }}>
      <NavigationControls
        registry={registry}
        handleDialogOpen={handleDialogOpen}
        handleValidateDialogOpen={handleValidateDialogOpen}
      />
      <RegistryGraph registry={registry} />
      {isValidateDialogOpen && (
        <JSONValidator open={true} setOpen={() => setValidateDialogOpen(false)} />
      )}
      {isDialogOpen && (
        <RegistryEditor
          registry={registry}
          onUpdateRegistry={handleUpdateRegistry}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </Stack>
  );
};

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
