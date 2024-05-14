import * as ReactDOMClient from "react-dom/client";
import moduleDevConfig from "@settings";
import React, { useEffect, useState } from "react";
import SceneEditor from "pbcSceneOrchestrator/pages/Orchestrator";
import { actions, state } from "pbcUX/providers/Settings";
import { DataStore, useDatabaseStore } from "pbcServices/Sockets";
import { getRegistry, Registry } from "pbcRegistry/Registry";
import { initApi } from "pbcServices/Swagger";
import { ISceneWithId } from "pbcServices/schema/SceneWithId";
import { LoadingPage } from "pbcUX/atoms/spinners";
import "./index.scss";

// Load corporative image UI from PBC UX
const DigitalTwin = React.lazy(() => import("pbcUX/DigitalTwin").then());

// Definition of the digital twin UI and components that handle the UI route
const settings = {
  defaultState: state,
  defaultActions: actions,
  routerConfig: {
    router: [
      {
        dashboard: true,
        label: "Scene Orchestrator",
        path: "/dashboard",
        component: "OrchestratorFeature",
        icon: "eva:people-fill",
        visible: true,
      },
    ],
  },
};

export const OrchestratorFeature = ({ registry }: { registry: Registry }) => {
  // Load scene for digital twin store, so we get live updates
  const scene = useDatabaseStore((store: DataStore) => store.scene) as ISceneWithId;

  // Get information about logged user
  const user = useDatabaseStore((store: DataStore) => store.user);

  const options = {
    sceneTree: true,
    meshSelector: true,
    cameraReset: true,
    workflowUI: true,
    debugUI: user?.role === "ADMIN",
  };

  // Render orchestrator
  return <SceneEditor data={scene} editable={true} options={options} />;
};

const App = () => {
  // Digital Twin current configuration
  const [registry, setRegistry] = useState<Registry | null>(null);

  // Show loading UI while loading the registry
  const [isLoading, setLoading] = useState<boolean>(true);

  // Connection error messages
  const [error, setError] = useState<string | null>(null);

  // Digital Twin components hooked to UI
  const [routerComponents, setComponents] = useState<any>({});

  // Component initial setup
  useEffect(() => {
    // Fetch configuration used to access resources and configurations
    getRegistry().then((registry) => {
      const errorMessage =
        "Apologies, we encountered a hiccup while fetching the registry data. Please check your internet connection and try again later.";
      if (registry) {
        setRegistry(registry);
        // Configure real-time data store services locally available for PBCs
        initApi(registry)
          .then(() => {
            // Import and customize components from PBCs that are used in this digital twin
            setComponents({
              OrchestratorFeature: () => <OrchestratorFeature registry={registry} />,
            });
            setLoading(false);
          })
          .catch(() => setError(errorMessage));
      } else {
        setError(errorMessage);
      }
    });
  }, []);

  // Loading UI
  if (!registry || isLoading) {
    return <LoadingPage hideSpinner={error !== null} text={error ?? undefined} />;
  }

  // Digital-Twin
  return (
    <React.Suspense fallback={<LoadingPage />}>
      <DigitalTwin
        //
        {...settings}
        // Registry configuration for connectivity and settings
        registry={registry}
        // Component list for the digital twin
        routerComponents={routerComponents}
        // Basename for production and development environments
        basename={moduleDevConfig.devServerHost ? undefined : moduleDevConfig.proxyPath}
      />
    </React.Suspense>
  );
};

const root = ReactDOMClient.createRoot(document.getElementById("app") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
