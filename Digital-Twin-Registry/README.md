# Digital Twin Registry

The **Digital Twin Registry** project simplifies the management of micro-frontends, enabling efficient updates and maintenance of individual components. This guide provides detailed instructions for updating the configuration and running the development server. For more information on the registry service, refer to this [link](./registry/README.md).

## Updating Configuration

### 1. Modify PBC's `module.json`

- Navigate to `./config/module.json`.
- Update the `devServerHost` setting to `"http://localhost"`.
- This ensures the webpack server uses the development version of the manifest instead of the production one.

### 2. Modify PBC's `.env`

- Navigate to `./registry/bin`.
- Update the `.env` file, setting the `DIGITAL_TWIN_HOST` to your local IP. This is crucial for container communication.
- Update the `.env` file, setting the `DIGITAL_TWIN_CODENAME` to the folder name of your app project in Digital-Twin-Apps. This project describes the configuration of the digital twin.
- If the `.env` file is missing, run the `orchestrator.sh` script in your bash shell. Choose either:
  - 1. Step-by-step configuration
  - 7. Configure builder for current configurations
- The latter option applies predefined settings.

## Development Server

### 1. Run Container

- Use the `orchestrator.sh` script. Ensure the previous steps are completed.
- Choose:
  - 2. Build all modules
  - 3. Build one by one
- Build and run the registry, as the frontend needs an API to manage Docker containers.
- If you encounter issues, consult the project FAQ.

### 2. Start Development Server

- After making the necessary changes, run `yarn start` to initiate the development server.
- This allows you to test and preview the modifications in a local development environment.

## Introducing New Features

### 1. Include Features in `exposes` Section

- When introducing new features, add them to the `exposes` section of `module.json`.
- This enables other micro-frontends to seamlessly utilize the new features.

## Additional Resources

For detailed instructions on editing `module.json` or further development guidelines, refer to the [developer documentation](./docs/PBC.md).
