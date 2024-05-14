# [← Home ](../README.md) / [Documentation](./README.md) / [API](./API.md) / Environment Variables

This document describes the environment variables used by the Digital Twin platform. These variables are used to configure various aspects of the platform, including the location of the Docker registry, host IP address, credentials for Keycloak, database settings, and more.

## DIGITAL_TWIN_REGISTRY

This variable specifies the Docker registry URL for the Digital Twin platform. The platform uses this registry to store images used by the platform. The default value for this variable is:

```
DIGITAL_TWIN_REGISTRY="registry.gitlab.com/...."
```

## DIGITAL_TWIN_HOST

This variable specifies the IP address of the host where the Digital Twin platform is or will be deployed for development. This is usually the local IP address of the development machine. The default value for this variable is:

```
DIGITAL_TWIN_HOST=10.0.50.12
```

## KEYCLOAK_USER

This variable specifies the default username for Keycloak, which is used for authentication and authorization. The default value for this variable is:

```
KEYCLOAK_USER=admin
```

## KEYCLOAK_PASSWORD

This variable specifies the default password for Keycloak, which is used for authentication and authorization. The default value for this variable is:

```
KEYCLOAK_PASSWORD=qwerty
```

## KEYCLOAK_DB_PASSWORD

This variable specifies the default password for the Keycloak database. The default value for this variable is:

```
KEYCLOAK_DB_PASSWORD=password
```

## KEYCLOAK_FRONTEND_URL

This variable specifies the URL for the Keycloak frontend, which is used for authentication and authorization. The default value for this variable is:

```
KEYCLOAK_FRONTEND_URL=http://localhost/auth
```

## PROXY_ADDRESS_FORWARDING

This variable specifies whether or not proxy address forwarding is enabled. The default value for this variable is:

```
PROXY_ADDRESS_FORWARDING=true
```

## MYSQL_ROOT_PASSWORD

This variable specifies the default password for the MySQL root user. The default value for this variable is:

```
MYSQL_ROOT_PASSWORD=root
```

## MYSQL_DATABASE

This variable specifies the name of the Keycloak database. The default value for this variable is:

```
MYSQL_DATABASE=keycloak
```

## MYSQL_USER

This variable specifies the default username for the Keycloak database. The default value for this variable is:

```
MYSQL_USER=keycloak
```

## SWAGGER_API_MONGODB_DOWNLOAD_URL

This variable specifies the download URL for the MongoDB software used by the data instance service. The default value for this variable is:

```
SWAGGER_API_MONGODB_DOWNLOAD_URL=https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu1804-4.2.8.tgz
```

## SWAGGER_API_MONGODB_VERSION

This variable specifies the version of the MongoDB software used by the data instance service. The default value for this variable is:

```
SWAGGER_API_MONGODB_VERSION=4.2.8
```

## SWAGGER_EMULATOR_PORT

This variable specifies the port number where the emulator web interface can be accessed. The default value for this variable is:

```
SWAGGER_EMULATOR_PORT=8088
```
