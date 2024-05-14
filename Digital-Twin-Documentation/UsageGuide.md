# [← Home ](../README.md) / [Documentation](./README.md) / Usage Guide

This guide provides comprehensive instructions, examples, and best practices for effectively utilizing the project's features. Whether you're a novice seeking guidance on initial setup or an experienced user looking to explore advanced functionalities, this guide offers step-by-step tutorials and practical insights to enhance your experience with the project.

## Requirements

The framework requires the following tools to build and create new releases:

- Docker Compose
- npm or yarn (required to create new releases)

Some files might not have proper encoding depending on your distribution and git configuration.
Please ensure the correct line endings if you find errors during installation.

```
sed -i -e 's/\r$//' ./Digital-Twin-Registry/orchestrator.sh
sed -i -e 's/\r$//' ./Digital-Twin-Registry/registry/data/installer/services-config.sh
sed -i -e 's/\r$//' ./Digital-Twin-Registry/registry/data/installer/pack.sh
sed -i -e 's/\r$//' ./Digital-Twin-Registry/registry/data/.env-template
```


## Configuration Basics

Please follow this instructions if you received a distribution release. Otherwise check Development Build section.

1. Open a Linux-based console (e.g. `linux`, `mingw` or `git bash`) in the folder `Digital-Twin-Distribution`.
2. Run the following command to install and run the service:

```
  ./run.sh --exec localhost 80
```

3. Stop the service with

```
  ./run.sh --stop
```

4. Start the service after the first time

```
  ./run.sh --run localhost 80 http
```

5. Update service

```
  docker-compose pull
  ./run.sh --stop
  ./run.sh --run localhost 80 http
```

NOTE: for custom domains enter the URL without protocol, e.g. wwww.google.com instead of https://www.google.com

## Development Build

1. Open a Linux-based console (e.g. `wsl`, `mingw` or `git bash) in this folder.
2. Run the following command:

```
  sh orchestrator.sh
```

3 Select `1` to create a new system configuration and then use option `2` to build the framework or `5` to use the latest build.

## Tested With OS

- Linux ubuntu 20.04.1
- Linux ubuntu 18.04.1 LTS
- Windows 10
- Windows 11

## More information

For additional details, please refer to the following resources:

- [ISSUES](/Digital-Twin-Documentation/ISSUES.md) - This document provides help with project-related issues.
- [ENVIRONMENT VARIABLES](/Digital-Twin-Documentation/ENVIRONMENT.md) - Explore explanations of various variables utilized in configuring this project.
- [DEVELOPMENT DOCUMENTATION](/Digital-Twin-Documentation/DEVELOPMENT.md) - Learn more about the development process of the project and how to contribute.
