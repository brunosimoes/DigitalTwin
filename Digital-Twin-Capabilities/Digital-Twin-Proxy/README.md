# Nginx Reverse Proxy Configuration Guide

Nginx is a high-performance web server, often utilized as a reverse proxy to enhance performance, security, and scalability of web applications. In this guide, we'll walk you through configuring Nginx as a reverse proxy to efficiently route traffic between clients and backend servers.

## Configuration Basics

Nginx's reverse proxy configuration resides primarily in its `nginx.conf` file. Understanding this file's structure and directives is crucial for tailoring Nginx to your specific needs.

```
http {
    upstream backend_servers {
        server backend1.example.com;
        server backend2.example.com;
        # Add more backend servers as needed
    }

    server {
        listen 80;
        server_name yourdomain.com;

        location / {
            proxy_pass http://backend_servers;
            # Additional proxy settings can be added here
        }
    }
}
```

Nginx can be configured as a reverse proxy by modifying its configuration file `proxy.conf`.

The file `proxy.conf` can include placeholders for `@UPSTREAM_LIST`, `@LOCATION_LIST`, and `@ENTRY_POINT`. These placeholders will be replaced with actual configurations to set up the containers in the Digital Twin.

`@UPSTREAM_LIST` will be populated with lines like this, automatically generated from module definitions:

```
set $upstream_digital_twin_keycloak "digital-twin-keycloak"
```

`@LOCATION_LIST` will be filled with lines like this, also automatically generated from module definitions:

```
  location /auth {
    proxy_pass http://$upstream_digital_twin_keycloak:8080;
  }
```

To customize the location's content for some module, modify the `${module_root_dir}/config/proxy.conf` file. If this file exists, its contents will be utilized instead of automatically generated content.

## Running Nginx Reverse Proxy

You can deploy Nginx as a reverse proxy using Docker with the following command:

```
docker-compose up -d digital-twin-proxy
```

You'll locate the necessary files in either `Digital-Twin-Distribution\build` or `Digital-Twin-Distribution` after executing `run.sh`. Refer to the framework's README for further guidance. Note that `proxy.conf` in the distribution directory is automatically generated for the Digital Twin containers.

# Conclusion

Nginx can be easily configured as a reverse proxy by modifying its configuration file. By using a reverse proxy, you can improve the performance and security of your web applications.
