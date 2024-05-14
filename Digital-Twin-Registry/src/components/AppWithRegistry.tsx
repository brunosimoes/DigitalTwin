import React, { useState, useEffect, createContext, useContext } from "react";
import { Registry, getRegistry } from "@definitions/RegistryDefinition";
import LoadingPage from "./spinners/LoadingPage";

// Create a Context for the registry
const RegistryContext = createContext<Registry | null>(null);

// Custom hook to use the RegistryContext
export const useRegistry = () => {
  return useContext(RegistryContext);
};

export const AppWithRegistry = ({ children }: any) => {
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>;
};

export default AppWithRegistry;
