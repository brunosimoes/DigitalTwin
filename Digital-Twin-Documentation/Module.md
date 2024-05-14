# [← Home ](../README.md) / [Documentation](./README.md) / [API](./API.md) / Module Configuration

This file provides an overview of the module configuration structure used in our system.

## Core Configuration

The file `module.json` is required for defining a module in our framework. This configuration is essential for both development and production environments. This configuration can be validated against typescript interface `Module`.

### Properties

- **id**: A unique identifier for the module composed only of letters.
- **type**: The type of module, which can be one of the following: `microfrontend`, `microservice`, `hybrid`, or `other`.
- **label**: A human-readable name for the module.
- **rootDir**: The folder name of the module, e.g., `./Digital-Twin-Proxy`.
- **enableProxy**: A boolean indicating whether to generate Nginx proxy definitions for this module.
- **proxyPath**: The path to be added to the base URL for Nginx to map to this module container.
- **dockerImage**: An optional field specifying the Dockerfile used for building the Docker image of this container.
- **dockerContainer**: The name of the Docker container, using only letters and the '-' symbol.
- **dockerEnvironment**: Optional key-value pairs for Docker environment settings, e.g., `[{ 'DISPLAY': '$DISPLAY' }]`.
- **dockerPorts**: Optional key-value pairs for Docker port bindings, e.g., `[{ '8080': '3000' }]`.
- **dockerVolumes**: Optional array of volume bindings for Docker, each with a `source`, `target`, and `create` flag.
- **dockerHealthCheck**: A boolean indicating whether to generate a health check for the microfrontend remote API.
- **documentation**: The name of the distribution markdown file documenting this module. The content of `README.md` will be used.
- **pathTemplate**: The file path to the index HTML file, e.g., `./src/index.html`.
- **routeCapabilities**: The filename of the microfrontend manifest file, e.g., `remote.js`. For microservices, this is the endpoint for health checks.
- **pathTypescript**: The file path for microfrontend types, e.g., `public/types`.
- **pathPublicAssets**: A list of public directories to include in the public directory of the release.
- **remotes**: An array managing module dependencies.
- **exposes**: An array of exposed microfrontend APIs.
- **devServerPort**: The port for the development Webpack server.
- **servicesMap**: Private classification mappings for the Digital Twin Consortium. Includes group, upstream, and other optional properties.
- **microservices**: Optional bindings for Docker microservices.
- **config**: Optional module-specific configuration settings in a key-value format.

## Extended Configuration

These properties provide more information and configurations necessary for the module's deployment and operation: They are all automatically generated once we configure the framework and can be fine-tuned afterwards. This configuration can be validated against typescript interface `Module`.

### Additional Properties

- **version**: The module version, fetched from `package.json`.
- **endpoint**: The filename for the module manifest file. This is automatically generated during configuration.
- **remote**: The public URL to the module manifest file. This is automatically generated during configuration.
- **url**: The base URL for federated module resources. This is automatically generated during configuration.
- **devServerHost**: The URL to the local server. Use the IP address so containers can reach host containers. Values are automatically overridden during configuration, e.g., `http://192.168.122.3`.
- **devRegistryURL**: The URL to the local registry server. Use the IP address so containers can reach host containers. Values are automatically overridden during configuration, e.g., `http://192.168.122.3/registry`.
