# @@PROJECT_NAME@@

@@PROJECT_DESCRIPTION@@

## Requirements

In order to use the platform, you will need to have the following tools installed:

- Docker Compose: This is a tool for defining and running multi-container Docker applications. It is used to create a development environment for the platform.
- git (optional): Git is a version control system that can be used to manage the source code of the platform. While it is not required to use the platform, it can be helpful for developers who want to contribute to the project.
- npm (required to build)

Some additional tools may be required to create a framework package. Follow the instructions below to ensure that all dependencies are installed in case you plan to build the code from source.


## Get Started

To run @@PROJECT_NAME@@, follow the instructions below.

- Open a command prompt.
- Change the directory to the root folder of the project.
- Run the following command to log in to GitLab's container registry:

```
docker login registry.gitlab.com
```

Use the token provided to you by email as the password and @@PROJECT_NAME_LOWERCASE@@ as username

- Pull all images to ensure that you have the latest version:

```
docker-compose pull
```

- To start the digital twin and all its associated services, run the following command:

```
docker-compose up -d
```

This command ensures that the services are always running, even when the PC restarts. If you do not want the services to start together with Docker Daemon, run the following command once the service is no longer required:

```
docker-compose stop
```

All these commands must be executed from the root folder, which contains the `docker-compose.yml` file.


### Installing Yarn

Yarn is a package manager that is preferred by the @@PROJECT_NAME@@ team, but it is not required to run the platform. To install Yarn using npm, run the following command:

```
npm install --global yarn
```

### Installing Libraries

To generate translation files for all modules and view the software license, install the following libraries:

```
yarn global add rimraf i18next-scanner license-checker
```

## Build from source code manually

To build the digital twin service, it is necessary to compile each module separately due to limitations imposed by both Docker Compose and the service itself. Specifically, the service requires that each compiled module be running after the build process has completed. Therefore, the commands necessary to build each module are listed below in a specific order, based on their dependencies.

To begin the build process, follow these steps:

1. Start by compiling the lowest level module. This is typically the module with the least number of dependencies. Once compiled, start a container running this module by running the appropriate command.

2. Next, compile the module that depends on the lowest level module that was just compiled. Again, start a container running this module after the compilation process is complete.

3. Continue compiling and running each subsequent module in the chain, ensuring that the modules are started in the correct order based on their dependencies.

By following this process, each module will be compiled and started in the correct order, ensuring that the entire digital twin service is built successfully. It is important to note that while this process may be time-consuming, it is necessary to ensure that the service is built correctly and is fully functional.

If your are developing new features then your should use a develop Docker image. In many cases, it is possible to mount volumes and code live, allowing the image to hotload any changes made to the code. However, this functionality will not be available in a production release. Instead, all code will be packed and optimized for running. It is important to ensure that the following variables are correctly configured to ensure that the build process runs smoothly:

- DIGITAL_TWIN_REGISTRY: This variable should be set to the address of your Docker registry.
- KEYCLOAK_FRONTEND_URL: This variable should be set to `http://localhost/auth`, which is the address of your local machine.
- DIGITAL_TWIN_HOST: This variable should be set to your IP, so containers can connect to the host's microfrontends
  By ensuring that these variables are correctly set, you can ensure that the develop build runs correctly and that the resulting Docker images are configured appropriately for development use. It is important to note that the specific values required for each variable may vary depending on your specific setup and requirements, so it is important to consult the relevant documentation or build instructions before proceeding.

Your variables should look like this:

```
DIGITAL_TWIN_REGISTRY="@@DIGITAL_TWIN_REGISTRY@@"
KEYCLOAK_FRONTEND_URL=@@KEYCLOAK_FRONTEND_URL@@
DIGITAL_TWIN_HOST=192.168.XXX.XXX
```

You can now generate all the required files and Docker Compose scripts using the following command:

```
yarn config:dev @@PROJECT_NAME_LOWERCASE@@
```

@@BUILD_INSTRUCTIONS@@

## Release Build

If you require a production build, it is important to ensure that the following [variables](./ENVIRONMENT.md) are correctly configured:

```
DIGITAL_TWIN_REGISTRY="@@DIGITAL_TWIN_REGISTRY@@"
KEYCLOAK_FRONTEND_URL=@@KEYCLOAK_FRONTEND_URL@@
DIGITAL_TWIN_HOST=192.168.XXX.XXX
```

You can now generate all the required files and Docker Compose scripts using the following command:

```
yarn config:prod @@PROJECT_NAME_LOWERCASE@@
```

@@BUILD_INSTRUCTIONS@@

## @@PROJECT_NAME@@ files

- docker-compose.production.yml - docker-compose file to deploy to https://@@PROJECT_NAME_LOWERCASE@@.vicomtech.org
- docker-compose.build.yml - docker-compose file to build the solution
- docker-compose.yml - docker-compose file to deploy to https://@@PROJECT_NAME_LOWERCASE@@.vicomtech.org
- realm-export.production.json - Keycloak settings for https://@@PROJECT_NAME_LOWERCASE@@.vicomtech.org
- realm-export.localhost.json - Keycloak settings for http://localhost
- gateway-settings.json - Settings to the emulator















## Possible Issues

The following are some common issues that users may face when running @@PROJECT_NAME@@:

- Docker Compose is not installed: Ensure that Docker Compose is installed on your system.
- Missing dependencies: Make sure that you have installed all the required libraries and tools.
- Image pull failed: If the image pull fails, try running the docker-compose pull command again.
- Authentication failure: Double-check your credentials when logging in to the GitLab registry.
- Port conflict: If another service is already using the port specified in the docker-compose.yml file, you will need to change the port or stop the conflicting service.

## Framework

This section is a valuable resource for information related to each microfrontend and microservice that is included in the framework. If you need to make any customizations to these components, or simply want to explore the available customization options, this is the place to look.

Customization options may include defining alternative credentials instead of using the default ones, or setting up specific volumes for storing data. By referring to the resources provided here, you can gain a deeper understanding of how to personalize each microfrontend and microservice to meet your unique requirements. Whether you are looking to fine-tune the components or completely overhaul them, the information here will guide you through the process.

@@DOCUMENTATION_MODULES@@
