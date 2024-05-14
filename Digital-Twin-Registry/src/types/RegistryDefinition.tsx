import registry from "@registry";

// Registry data types
export type DataType =
  | "text"
  | "select"
  | "checkbox"
  | "number"
  | "volumes"
  | "text-array"
  | "remotes"
  | "kv"
  | "licenses"
  | "private";

// Bindings for Docker microservices.
export interface Microservices {
  [key: string]: {
    name: string;
    url: string;
  };
}

// Docker volume bindings
export interface Volume {
  source: string;
  target: string;
  // Specifies if it is a volume and needs to be created.
  create: boolean;
}

// Key-Value dictionary
export interface KeyValue {
  [key: string]: string;
}

// Represents information about a software product or application.
export interface About {
  // Suite name (if applicable).
  suite?: string;

  // Optional alternative name.
  name?: string;

  // Information about software copyright.
  copyright?: string;

  // Brief description of the software.
  description?: string;

  // Additional information or details.
  about?: string[];

  headers?: {
    // URL or path to the first logo.
    firstLogo: string;

    // URL or path to the second logo.
    secondLogo: string;
  };
}

// Represents a cluster for visually displaying the modules of the digital twin.
export interface Cluster {
  // Unique identifier for the cluster.
  id: string;

  // Label or name of the cluster.
  label: string;

  // Position of the cluster in the map
  position: {
    // X-coordinate position of the cluster.
    x: number;

    // Y-coordinate position of the cluster.
    y: number;
  };

  // Style attributes
  style: {
    // Background color of the cluster.
    backgroundColor: string;

    // Width of the cluster.
    width: number;

    // Height of the cluster.
    height: number;
  };
}

// Represents an application manifest detailing various configurations and dependencies.
export interface AppManifest {
  // General information about this digital twin
  about?: About;

  // Unique code name for the application that matches the folder name inside Digital-Twin-Apps.
  id: string;

  // Release version, added to the image name.
  version: string;

  // Suffix for the main app entry point.
  entrypoint: string;

  // Docker registry for images associated with the app.
  dockerRegistry: string;

  // List of supported authentication methods.
  authenticationMethods: string[];

  // List of clusters and their definitions for organizing modules.
  groups: Cluster[];

  // List of modules to compile with this app.
  modules: {
    // Name of the module.
    name: string;

    // Indicates if the module should be built.
    build: boolean;
  }[];
}

// Minimal module configuration
export interface Module {
  // A unique identifier for this module composed only of letters.
  id: string;

  // The type of module: digital-twin, micro-frontend, micro-service, hybrid, or other.
  type: "digitaltwin" | "microfrontend" | "microservice" | "hybrid" | "otherservice";

  // A human-readable name for the module.
  label: string;

  // The folder name of the module, e.g., ./Digital-Twin-Proxy.
  rootDir: string;

  // Enable to generate Nginx proxy definitions for this module.
  enableProxy: boolean;

  // The path to be added to the base URL for Nginx to map to this module container.
  proxyPath: string;

  // The Dockerfile used for building the Docker image of this container.
  // If not defined searches for Dockerfile in config directory.
  // If define, search for the name in the config directory and then in the registry directory
  dockerImage?: string;

  // The name of the Docker container, using only letters and '-' symbols. We use as convention the prefix as digital-twin-.
  dockerContainer: string;

  // Containers that must be compiled prior to this PBC. This can be used to compile modules that are not PBCs
  dockerDependencyContainers?: string[];

  // Docker environment settings, e.g., [{ 'DISPLAY': '$DISPLAY' }].
  dockerEnvironment?: KeyValue;

  // Docker port bindings, e.g., [{ '8080': '3000' }].
  dockerPorts?: KeyValue;

  // Docker volume bindings, e.g., [{ 'source': 'files_data', 'target': '/home/app/DataRepository/static', 'create': true }]. The 'create' field specifies if the volume needs to be created.
  dockerVolumes?: Volume[];

  // Enable to generate a health check for the microfrontend remote API.
  dockerHealthCheck?: boolean;
  dockerHealthCheckEndpoint?: string;

  // Docker command
  dockerCommand?: string;

  // The name of the distribution markdown file documenting this module. The content of README.md will be used.
  documentation?: string;

  // The filename of the microfrontend manifest file, e.g., remote.js.
  routeCapabilities?: string;

  // Landing page
  routeLandingPage?: string;

  // List of public directories to include in the public directory of the release.
  pathPublicAssets?: string[];

  // The port for the development Webpack server.
  devServerPort: number;

  // Private classification mappings for the Digital Twin Consortium.
  servicesMap: {
    group: "data-services" | "integration" | "intelligence" | "ux" | "apps" | "trustworthiness";
    upstream?: string[];
    [key: string]: any;
  };

  // Bindings for Docker microservices.
  microservices?: Microservices;

  // Manage module dependencies.
  remotes?: string[];

  // Optional module-specific configuration settings. Use this to configure something inside the module.
  config?: KeyValue;
}

export interface Microservice extends Module {
  type: "microservice";

  // The URL to the local server. Use the IP address so containers can reach host containers. Values are automatically overridden on configuration, e.g., http://192.168.2.3.
  devServerHost?: string;

  // The URL to the local registry server. Use the IP address so containers can reach host containers. Values are automatically overridden on configuration, e.g., http://192.168.2.3/registry.
  devRegistryURL?: string;
}

export interface OtherService extends Module {
  type: "otherservice";

  // The URL to the local server. Use the IP address so containers can reach host containers. Values are automatically overridden on configuration, e.g., http://192.168.2.3.
  devServerHost?: string;

  // The URL to the local registry server. Use the IP address so containers can reach host containers. Values are automatically overridden on configuration, e.g., http://192.168.2.3/registry.
  devRegistryURL?: string;
}

// Module definition configured for a digital twin
export interface ModuleWithFederation extends Module {
  // Module version. Fetched from package.json
  version: string;

  // The filename for the module manifest file. Automatically generated on configuration.
  endpoint: string;

  // The public URL to the module manifest file. Automatically generated on configuration.
  remote: string;

  // The base URL for federated module resources. Automatically generated on configuration.
  url: string;

  // The URL to the local server. Use the IP address so containers can reach host containers. Values are automatically overridden on configuration, e.g., http://192.168.2.3.
  devServerHost: string;

  // The URL to the local registry server. Use the IP address so containers can reach host containers. Values are automatically overridden on configuration, e.g., http://192.168.2.3/registry.
  devRegistryURL: string;

  // The file path to the index HTML file, e.g., ./src/index.html.
  pathTemplate: string;

  // The file path for microfrontend types, e.g., public/types.
  pathTypescript: string;

  // Exposed microfrontend APIs.
  exposes: { [key: string]: string };
}

export interface Microfrontend extends ModuleWithFederation {
  type: "microfrontend";
}

export interface DigitalTwin extends ModuleWithFederation {
  type: "digitaltwin";

  // Information about the digital twin if this module is the Digital Twin entrypoint
  appManifest: AppManifest;

  // List of licenses
  licenses: {
    library: string;
    license: string;
    author: string;
  }[];
}

// All possible module types
export type PBC = DigitalTwin | Microservice | Microfrontend;

// List of modules
export interface RegistryModules {
  [key: string]: PBC;
}

// System registry
export interface Registry {
  modules: RegistryModules;
  config: RegistryModules;
  app: { modules: RegistryModules; appManifest: AppManifest };
}

interface FieldDefinition {
  type: DataType;
  tooltip?: string;
  options?: string[];
}

type EnsureAllKeys<T> = {
  [K in keyof T]: FieldDefinition;
};

export const RegistryTypeDefinition: EnsureAllKeys<PBC | AppManifest | About> = {
  id: {
    type: "text",
    tooltip: "A unique identifier for this module composed only of letters.",
  },
  type: {
    type: "select",
    options: ["microfrontend", "microservice", "hybrid", "other"],
    tooltip: "Select the type of module: micro-frontend, micro-service, hybrid, or other.",
  },
  label: {
    type: "text",
    tooltip: "A human-readable name for the module.",
  },
  rootDir: {
    type: "text",
    tooltip: "The folder name of the module, e.g. ./Digital-Twin-Proxy.",
  },
  enableProxy: {
    type: "checkbox",
    tooltip: "Enable to generate Nginx proxy definitions for this module.",
  },
  proxyPath: {
    type: "text",
    tooltip: "The path to be added to the base URL for Nginx to map to this module container.",
  },
  dockerCommand: {
    type: "text",
    tooltip: "Optional docker container command.",
  },
  dockerImage: {
    type: "select",
    options: [
      "Dockerfile.CSharp",
      "Dockerfile.DataArchitect",
      "Dockerfile.GeometryAPI",
      "Dockerfile.NodeJs",
      "Dockerfile.Python",
      "Dockerfile.React",
      "Dockerfile.ReactApp",
      "Dockerfile.Registry",
      "Dockerfile.Swagger",
      "Dockerfile.WebRTC",
    ],
    tooltip: "Select the Dockerfile used for building the Docker image of this container.",
  },
  dockerContainer: {
    type: "text",
    tooltip:
      "The name of the Docker container, using only letters and '-' symbols. We use as convention the prefix as digital-twin-.",
  },
  dockerEnvironment: {
    type: "kv",
    tooltip: "Docker environment settings, e.g., [{ 'DISPLAY': '$DISPLAY' }].",
  },
  dockerPorts: {
    type: "kv",
    tooltip: "Docker port bindings, e.g., [{ '8080': '3000' }].",
  },
  dockerVolumes: {
    type: "volumes",
    tooltip:
      "Docker volume bindings, e.g., [{ 'source': 'files_data', 'target': '/home/app/DataRepository/static', 'create': true }]. The 'create' field specifies if the volume needs to be created.",
  },
  dockerHealthCheck: {
    type: "checkbox",
    tooltip: "Enable to generate a health check for the microfrontend remote API.",
  },
  documentation: {
    type: "text",
    tooltip:
      "The name of the distribution markdown file documenting this module. The content of README.md will be used.",
  },
  pathTemplate: {
    type: "text",
    tooltip: "The file path to the index HTML file, e.g., ./src/index.html.",
  },
  routeCapabilities: {
    type: "text",
    tooltip:
      "The filename of the microfrontend manifest file, e.g., remote.js. For microservices, this is the endpoint for health checks.",
  },
  routeLandingPage: {
    type: "text",
    tooltip: "Landing page relative route",
  },
  pathTypescript: {
    type: "text",
    tooltip: "The file path for microfrontend types, e.g., public/types.",
  },
  pathPublicAssets: {
    type: "private",
    tooltip: "List of public directories to include in the public directory of the release.",
  },
  remotes: {
    type: "remotes",
    tooltip: "Manage module dependencies.",
  },
  exposes: {
    type: "private",
    tooltip: "Exposed microfrontend APIs.",
  },
  endpoint: {
    type: "text",
    tooltip: "The filename for the module manifest file. Automatically generated on configuration.",
  },
  remote: {
    type: "text",
    tooltip:
      "The public URL to the module manifest file. Automatically generated on configuration.",
  },
  url: {
    type: "text",
    tooltip:
      "The base URL for federated module resources. Automatically generated on configuration.",
  },
  devServerPort: {
    type: "number",
    tooltip: "The port for the development Webpack server.",
  },
  devServerHost: {
    type: "text",
    tooltip:
      "The URL to the local server. Use the IP address so containers can reach host containers. Values are automatically overridden on configuration, e.g., http://192.168.2.3.",
  },
  devRegistryURL: {
    type: "text",
    tooltip:
      "The URL to the local registry server. Use the IP address so containers can reach host containers. Values are automatically overridden on configuration, e.g., http://192.168.2.3/registry.",
  },
  servicesMap: {
    type: "private",
    tooltip: "Private classification mappings for the Digital Twin Consortium.",
  },
  microservices: {
    type: "kv",
    tooltip: "Bindings for Docker microservices.",
  },
  appManifest: {
    type: "private",
    tooltip: "Manifest mappings.",
  },
  licenses: {
    type: "licenses",
    tooltip: "Software licenses.",
  },
  config: {
    type: "kv",
    tooltip:
      "Optional module-specific configuration settings. Use this to configure something inside the module..",
  },
  headers: {
    type: "private",
    tooltip: "Header icon mappings.",
  },
  groups: {
    type: "private",
    tooltip: "Group mappings.",
  },
  modules: {
    type: "private",
    tooltip: "Modules mappings.",
  },
  about: {
    type: "private",
    tooltip: "About mappings.",
  },
};

export const getRegistryBaseURL = () => {
  return registry.pbcRegistry?.url;
};

export const getAppModule = (modules: RegistryModules): PBC | null => {
  const ms = modules;
  const key = Object.keys(ms).find((k) => (ms[k] as DigitalTwin).appManifest !== undefined);
  if (key) return ms[key];
  return null;
};

export const getAppManifest = (modules: RegistryModules) => {
  const app = getAppModule(modules) as DigitalTwin | null;
  if (app) return app.appManifest;
  return null;
};

export const getRegistry = async () => {
  try {
    const response = await fetch(`${getRegistryBaseURL()}/config`);
    if (response.ok) {
      const data = (await response.json()) as {
        config: RegistryModules;
        modules: RegistryModules;
        app: any;
      };
      const appManifest = getAppManifest(data.config);
      data.app = { modules: data.config, appManifest };
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};
