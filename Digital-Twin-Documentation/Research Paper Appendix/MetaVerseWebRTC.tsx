import * as ReactDOMClient from "react-dom/client";
import moduleDevConfig from "@settings";
import React, { useEffect, useState } from "react";
import RenderStreaming from "pbcWebRTC/pages/RenderStreaming";
import WebRtcSender from "pbcWebRTC/organisms/WebRtcSender";
import { actions, state } from "pbcUX/providers/Settings";
import { EdgeRenderer } from "./EdgeRenderer";
import { EngineWeb3D, GeometryChange } from "pbcMetaverse/renderers/SceneContext";
import { getRegistry, Registry } from "pbcRegistry/Registry";
import { getWebSocketsURI } from "pbcServices/Services";
import { initApi } from "pbcServices/Swagger";
import { LoadingPage } from "pbcUX/atoms/spinners";
import { RemoteSupportProvider } from "pbcWebRTC/providers/RemoteSupportProvider";
import { Web3D } from "pbcMetaverse/Web3D";
import { WebRtcReceiver } from "pbcWebRTC/organisms/WebRtcReceiver";
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
        label: "WebRTC",
        path: "/dashboard",
        component: "MetaverseWebRTC",
        icon: "eva:people-fill",
        visible: true,
      },
    ],
  },
};

// Our feature simply reuses PBC with some params
export const MetaverseFeature = ({ registry }: { registry: Registry }) => {
  return (
    <Web3D
      registry={registry} // Required to download access from framework
      scenes={[]} // Provide some scene data
      engine={EngineWeb3D.POTREE}
      onSceneReady={() => {
        // On scene ready
      }}
      onGeometryChange={(data: GeometryChange) => {
        // Handle scene change, either by the system or by the user
      }}
    />
  );
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
            setComponents([
              {
                // Example of a web browser rendering node
                name: "Edge Renderer",
                comp: () => (
                  <RemoteSupportProvider
                    user={{ userId: "target", name: "render" }}
                    url={getWebSocketsURI(registry)}
                  >
                    <EdgeRenderer>
                      <WebRtcSender />
                    </EdgeRenderer>
                  </RemoteSupportProvider>
                ),
              },
              {
                // Example of a thin client that connects to the web browser rendering nodes
                name: "Thin Client",
                comp: () => (
                  <RemoteSupportProvider
                    user={{ userId: "viewer", name: "viewer" }}
                    url={getWebSocketsURI(registry)}
                  >
                    <WebRtcReceiver options={{ enableCamera: true, enableMouseEvents: true }} />
                  </RemoteSupportProvider>
                ),
              },
              {
                // Example of how to use a Unity3D remote rendering backend
                name: "Render Streaming",
                comp: () => <RenderStreaming url="http://localhost:3102" />,
              },
            ]);
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
