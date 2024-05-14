#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <name>"
    exit 1
fi

if [ -f .env ]; then
  set -o allexport
  source .env
  set +o allexport
fi

export container_names='$container_names'
export container_name='$container_name'
export docker_compose_file='$docker_compose_file'
export replacement_value='$replacement_value'
export protocol_value='$protocol_value'
export upstream_proto='$upstream_proto'
export scheme='$scheme'
export service='$service'
export health_status='$health_status'
export container_id='$container_id'

script_name=$1

echo "#!/bin/bash" > "$script_name"
echo "" >> "$script_name"

echo "install_service() {" >> "$script_name"
echo "# Create docker-compose.yml" >> "$script_name"
echo 'cat <<EOF > docker-compose.yml' >> "$script_name"
envsubst < docker-compose.yml >> "$script_name"
echo "" >> "$script_name"
echo 'EOF' >> "$script_name"
echo "" >> "$script_name"

echo "# Create proxy.conf" >> "$script_name"
echo 'cat <<EOF > proxy.conf' >> "$script_name"
cat proxy.conf | sed 's/\$/\\$/g' >> "$script_name"
echo "" >> "$script_name"
echo 'EOF' >> "$script_name"
echo "}" >> "$script_name"

echo "" >> "$script_name"
envsubst < services-config.sh >> "$script_name"

chmod +x "$script_name"