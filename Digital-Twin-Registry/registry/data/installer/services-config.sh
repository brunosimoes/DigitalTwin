
# Function to display help information
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  --help                           Display this help message"
    echo "  --install                        Install service"
    echo "  --scheme                         Force http/https protocol"
    echo "  --clean                          Remove 'docker-compose.yml' and 'proxy.conf'"
    echo "  --stop                           Stop containers if 'docker-compose.yml' exists"
    echo "  --run <host> <port> http|https   Configure services with the specified host and port"
    echo "  --exec <host> <port> http|https  Install and configure services with the specified host and port"
}

# Scheme
set_scheme(){
    local scheme="$1"

    # Replace the value of set $upstream_proto
    sed -i "s|set \$upstream_proto \"[^\"]*\";|set \$upstream_proto \"$scheme\";|g" proxy.conf

    # Replace the proxy_set_header X-Forwarded-Proto line
    sed -i "s|proxy_set_header X-Forwarded-Proto \$scheme;|proxy_set_header X-Forwarded-Proto \$upstream_proto;|g" proxy.conf

    echo "Nginx config updated with scheme: $scheme"
}

# Function to clean up files
clean_up() {
    echo "Cleaning up files..."
    rm -f docker-compose.yml proxy.conf watchtower.yml
    echo "Files removed successfully."
}

# Function to stop containers
stop_containers() {
    if [ -f "docker-compose.yml" ]; then
        echo "Stopping containers..."
        docker-compose down
        echo "Containers stopped successfully."
    else
        echo "'docker-compose.yml' not found. No containers to stop."
    fi
}

is_healthy() {
    service="$1"
    container_id="$(docker-compose ps -q "$service")"
    health_status="$(docker inspect -f "{{.State.Health.Status}}" "$container_id")"

    if [ "$health_status" = "healthy" ]; then
        return 0
    else
        return 1
    fi
}

# Function to configure services with specified host and port
run_services() {
    # Check if docker-compose.yml file exists
    if [ ! -f "docker-compose.yml" ]; then
        echo "'docker-compose.yml' is missing!"
        exit 1
    fi

    # Check if proxy.config file exists
    if [ ! -f "proxy.conf" ]; then
        echo "'proxy.conf' is missing!"
        exit 1
    fi

    echo "Configuring services..."

    # Update proxy port
    awk -v new_port="$2" '
        /^ *container_name: *digital-twin-proxy/ {
            inside_block = 1;
        }
        inside_block && /^ *ports:/ {
            in_ports_block = 1;
            print;  # Print the "ports:" line
            next;   # Skip to the next line
        }
        inside_block && in_ports_block {
            gsub(/[0-9]+:/, new_port ":");
            in_ports_block = 0;
            inside_block = 0;
        }
        { print }
    ' "docker-compose.yml" > tmp.yml && mv tmp.yml "docker-compose.yml"

    echo "Port updated to $2 for digital-twin-proxy container."

    docker-compose up -d --force-recreate
    echo "Waiting for services to start..."
    while ! is_healthy digital-twin; do sleep 1; done

    # Extract container names with matching images
    container_names=$(awk -v registry="${DIGITAL_TWIN_REGISTRY}" '
        $1 == "image:" {
            image=$2
            gsub(/["${}]/, "", image)
            if (index(image, registry) > 0) {
                getline
                getline
                if ($1 == "container_name:") {
                    print $2
                }
            }
        }' docker-compose.yml)

    # Print filtered container names
    echo "Configuring containers:"
    echo "$container_names"

    # Run the command inside each container
    for container_name in $container_names; do
        echo "Configuring container: $container_name for $1"
        replacement_value="$1"
        protocol_value="$3"
        docker exec "$container_name" find ./ -type f ! -path './node_modules/*' -exec sed -i -e "s#http://localhost#$protocol_value://localhost#g" -e "s#localhost#$replacement_value#g" {} \;
        docker container commit "$container_name"
    done
}

# Main script logic
case "$1" in
    --help)
        show_help
        ;;
    --install)
        install_service
        ;;   
    --clean)
        clean_up
        ;;
    --scheme)
        set_scheme "$2"
        ;;
    --stop)
        stop_containers
        ;;
    --run)
        if [ "$#" -ne 4 ]; then
            echo "Error: Invalid number of arguments for --run. Specify <host> <port> <http/https>."
            exit 1
        fi
        run_services "$2" "$3" "$4"
        ;;
    --exec)
        if [ "$#" -ne 4 ]; then
            echo "Error: Invalid number of arguments for --exec. Specify <host> <port> <http/https>."
            exit 1
        fi
        clean_up
        install_service
        run_services "$2" "$3" "$4"
        ;;
    *)
        echo "Error: Invalid option. Use './run.sh --help' for usage information."
        exit 1
        ;;
esac
