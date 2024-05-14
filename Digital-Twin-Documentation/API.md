# [← Home ](../README.md) / [Documentation](./README.md) / API Documentation

Developers seeking to integrate the project into their applications can leverage our comprehensive API documentation. This resource provides detailed insights into the project's application programming interface, including endpoints, request/response formats, authentication mechanisms, and usage examples.

If you are manually configuring this system, you need to pay attention to two critical configuration files: `.env` and `module.json`.

## Environment Variables

The `.env` file is located at `./Digital-Twin-Registry/registry/bin` and defines the variables used to configure the system, as well as those used by Docker Compose to build and run the project. During the configuration step, this file is copied to the distribution directory. If the file does not exist, it will be generated from `./Digital-Twin-Registry/registry/data/.env-template`. For additional details on this configuration file, refer to the [Environment Variables documentation](./Environment.md).

## Module Configuration

Each module in the system should contain a `module.json` file, located inside the module's directory within `./Digital-Twin-Capabilities`. This file should be placed in `config/module.json`. For additional details on this configuration file, refer to the [Module Configuration documentation](./Module.md).
