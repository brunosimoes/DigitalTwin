## proxy.conf

If you are multi-proxies and you orgin is using https, then you can force that information to containers. Change the proxy.conf:

set \$upstream_proto "https";

# To forward the original protocol (HTTP or HTTPS)

proxy_set_header X-Forwarded-Proto \$upstream_proto;
