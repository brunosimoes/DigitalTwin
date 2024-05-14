#!/bin/bash
root_dir=$(dirname "$(pwd)")
distribution_dir="$root_dir/Digital-Twin-Distribution"  
build_dir="$distribution_dir/build"
registry_dir="$(pwd)/registry"
bin_dir="$registry_dir/bin/"

clean_projects(){
  echo "Starting the cleaning process ..."
  cd "${registry_dir}"
  yarn clean-projects
}

set_env_variable() {
  local var_name="$1"
  local prompt_message="$2"
  read -p "$prompt_message" value
  if [ -n "$value" ]; then
    # Check if the variable already exists in the .env file
    if grep -q "^$var_name=" .env; then
      # Variable exists; replace its value
      sed -i "s|^$var_name=.*$|$var_name=$value|" .env
    else
      # Variable doesn't exist; append it
      echo "$var_name=$value" >> .env
    fi
  fi
}

set_env_variables() {
  cd "$bin_dir"
  cp ../data/.env-template .env
  set_env_variable "DIGITAL_TWIN_HOST" "Local/Public IP of the machine: "
  set_env_variable "DIGITAL_TWIN_VERSION" "Release version (Use only letters a-z): "
  set_env_variable "DIGITAL_TWIN_HOSTNAME" "WebApp URL without protocol (e.g. viewer-digital-twin.com): "
  set_env_variable "SWAGGER_API_HOSTNAME" "API URL without protocol (e.g. api-digital-twin.com). You can use the same as the web app: "
  set_env_variable "DIGITAL_TWIN_CODENAME" "Release template (leave this empty unless you received different intructions): "
  set_env_variable "DIGITAL_TWIN_PROXY_PORT" "Proxy port (leave this empty unless you received different intructions): "
}

configure_projects(){
  echo "Applying user configurations to the project ..."
  cd "${registry_dir}"
  yarn --ignore-engines && yarn config-projects
}

configure_dist(){
  # Ensure the script exits if any command fails
  set -e

  # Clear project temp files
  clean_projects

  # Generate configuration
  configure_projects

  chmod -R 777 "${build_dir}/data-models"

  # Move run.sh script to the distribution directory
  cd "$build_dir" && ./pack.sh ./run.sh && mv run.sh "$distribution_dir/"

  echo "Now you can build the project or run a pre-compiled version."
}
 
build_project_from_source_code() {
  if [ -e "${build_dir}/.env" ]; then
    echo "Building a new release from source code ..."
    cd "${build_dir}" && chmod a+x ./service_deploy.sh && sed -i -e 's/\r$//' ./service_deploy.sh && ./service_deploy.sh
  else
    echo "You need to configure the project before building (Option 1)."
  fi
}

build_module_from_source_code() {

  # Check if the JSON file exists
  local builder_file="${build_dir}/docker-compose.builder.yml"
  if [ ! -f "$builder_file" ]; then
    echo "Builder configuration is missing: $builder_file"
    echo "If you already have a configuration (option 1), then you only need to configure the builder (option 7)"
    return 1
  fi

  # Parse the file and store keys in an array
  local container_names=()
  while IFS= read -r line; do
    if [[ "$line" =~ container_name:[[:space:]]*(.+) ]]; then
      container_name="${BASH_REMATCH[1]}"
      # Trim leading/trailing whitespace and remove any non-printable characters
      container_name=$(echo "$container_name" | tr -d '[:space:]' | tr -cd '[:print:]')
      container_names+=("$container_name")
    fi
  done < "$builder_file"

  # Display menu options
  echo "Select an option:"
  for ((i = 0; i < ${#container_names[@]}; i++)); do
    echo "$((i + 1)). ${container_names[i]}"
  done

  # Read user input for the selected option
  read -p "Enter the module number: " option_num

  # Validate user input
  if [[ ! "$option_num" =~ ^[0-9]+$ ]] || ((option_num < 1 || option_num > ${#container_names[@]})); then
    echo "Invalid option. Please enter a valid option number."
    return 1
  fi

  # Get the selected key and print it
  selected_key="${container_names[option_num - 1]}"
  echo "Selected key: $selected_key"

  cd "${build_dir}"
  docker-compose -f docker-compose.builder.yml build --no-cache $selected_key
  docker-compose -f docker-compose.yml up --force-recreate -d $selected_key 
}

run_from_docker_registry(){
  if [ -e "${build_dir}/.env" ]; then
    echo "Starting a new instance from docker registry (you must be logged!!) ..."
    cd "${build_dir}"
    docker-compose -f docker-compose.yml up -d 
  else
    echo "You need to configure the project before this step (Option 1)."
  fi
}

update_local_release(){
  if [ -e "${build_dir}/.env" ]; then
    echo "Updating your current version ..."
    cd "${build_dir}"
    chmod a+x ./service_update.sh
    ./service_update.sh
  else
    echo "We could not detect your current version. Build or run a prebuilt version."
  fi
}

push_new_version(){
  if [ -e "${build_dir}/.env" ]; then
    echo "Updating your current version ..."
    docker-compose -f "${build_dir}/docker-compose.builder.yml" push
  else
    echo "We could not detect your current version. Build or run a prebuilt version."
  fi
}

delete_module() {
  local json_file="${build_dir}/registry.json"
  local selected_key

  # Check if the JSON file exists
  if [ ! -f "$json_file" ]; then
    echo "Error: JSON file not found: $json_file"
    return 1
  fi

  # Parse the JSON file and store keys in an array
  local keys=()

  while IFS= read -r line; do
    if [[ "$line" =~ \"dockerContainer\":\ \"([^\"]+)\" ]]; then
      key="${BASH_REMATCH[1]}"
      keys+=("$key")
    fi
  done < "$json_file"

  # Display menu options
  echo "Select an option:"
  for ((i = 0; i < ${#keys[@]}; i++)); do
    echo "$((i + 1)). ${keys[i]}"
  done

  # Read user input for the selected option
  read -p "Enter the module number: " option_num

  # Validate user input
  if [[ ! "$option_num" =~ ^[0-9]+$ ]] || ((option_num < 1 || option_num > ${#keys[@]})); then
    echo "Invalid option. Please enter a valid option number."
    return 1
  fi

  # Get the selected key and print it
  selected_key="${keys[option_num - 1]}"
  echo "Selected key: $selected_key"

  cd "${build_dir}"
  docker-compose -f docker-compose.builder.yml build --no-cache $selected_key
  docker-compose -f docker-compose.yml up --force-recreate -d $selected_key
}

create_pbc() {
  echo -e "\033[1;32m"

  read -p "Name of the PBC (e.g. Container): " label
  label=${label:-"Container"}

  read -p "Unique id for PBC registry (e.g. $label): " name
  name=${name:-"$label"}
  name_upper=$(echo "$name" | tr '[:lower:]' '[:upper:]')
  
  read -p "Language (options: ReactJS, CSharp, NodeJs): " language
  # Check if user defined one of the values
  if [ "$language" != "ReactJS" ] && [ "$language" != "CSharp" ] && [ "$language" != "NodeJs" ]; then
    echo "Invalid language. Please choose either React, CSharp or NodeJs."
    return 1
  fi
  
  read -p "Docker Image (default: Dockerfile.$language): " dockerImage
  dockerImage=${dockerImage:-"Dockerfile.$language" }

  read -p "Group (default: services): " group
  group=${group:-"services"}

  read -p "Name of the docker container (e.g. digital-twin-${label,,}) that will be created: " dockerContainer
  dockerContainer=${dockerContainer:-"digital-twin-${label,,}"}

  read -p "Project folder name (default: ${root_dir}/Digital-Twin-Capabilities/Digital-Twin-$name): " rootDir
  rootDir=${rootDir:-"${root_dir}/Digital-Twin-Capabilities/Digital-Twin-$name"}

  read -p "List the PBCs that you want to have preconfigured (e.g. \"pbcDashboards\", \"pbcWebRTC\", ...): " remotes
  remotes=${remotes:-""}

  read -p "Documentation file name (default: DIGITAL_TWIN_${name_upper}.md): " documentation
  documentation=${documentation:-"DIGITAL_TWIN_${name_upper}.md"}
  echo "Documentation file name: $documentation"

  read -p "Volumes (example: data:/home/app/Digital-Twin-$name/static/data, ./data-models:/home/app/Digital-Twin-$name/static/v): " volumes
  volumes=${volumes:-""}

  read -p "Enable Proxy (default: true): " enableProxy
  enableProxy=${enableProxy:-true}

  read -p "Proxy Path (default: /${label,,}): " proxyPath
  proxyPath=${proxyPath:-"/${label,,}"}

  read -p "Dev Server Port (default: 9999): " devServerPort
  devServerPort=${devServerPort:-9999}

  echo -e "\033[0m" # Reset color

  folder="${root_dir}/Digital-Twin-Plugins/$language"

  # Check if folder exists
  if [ ! -d "$folder" ]; then
    echo "Folder does not exist: $folder"
    return 1
  fi

  # Check if the key $name already exists in ./Digital-Twin-Registry/registry/config/modules.json
  if grep -q "\"$name\":" "${root_dir}/Digital-Twin-Registry/registry/config/modules.json"; then
    echo "Error: Key '$name' already exists in ${root_dir}/Digital-Twin-Registry/registry/config/modules.json."
    return 1
  fi

  # Copy folder to . and rename it as $rootDir
  cp -r "$folder" "$rootDir"

  # Copy the json to $rootDir/config/module.json
  cat <<EOF > "$rootDir/config/module.json"
{
  "id": "pbc$name",
  "devServerPort": $devServerPort,
  "rootDir": "./Digital-Twin-$name",
  "pathTemplate": "./src/index.html",
  "routeCapabilities": "remote.js",
  "pathTypescript": "public/types",
  "pathPublicAssets": [],
  "remotes": [$remotes],
  "exposes": {}
}
EOF

  echo "Project $label created $rootDir."
}

set_codename(){
  cd Digital-Twin-Registry
  set_env_variable "DIGITAL_TWIN_CODENAME" "Codename: "
  clean_projects
  configure_projects
}

options=(
  "Step-by-step configuration"
  "Build project from source code"
  "Build module from source code"
  "Run pre-built version from docker registry"
  "Pull (download) a new version to the registry"
  "Push (upload) a new version to the registry"
  "Configure builder for current configurations"
  "Clear projects solutions"
  "Restart"
  "Create PBC"
  "Remove module"
  "Build codename"
  "Quit"
)
  
echo 'Welcome to the Digital Twin Orchestrator 2024'
echo ''
PS3="Select an option (enter the number): "
select option in "${options[@]}"; do
  case "$REPLY" in
    1)
      echo "Please provide the following information to configure the project. Press enter to skip the data input."
      set_env_variables
      configure_projects
      echo "Now you can build the project or run a pre-compiled version."
      exit 0
      ;;
    2)
      build_project_from_source_code
      exit 0
      ;;
    3)
      build_module_from_source_code
      exit 0
      ;;
    4)
      run_from_docker_registry
      echo "Done. Quitting..."
      exit 0
      ;;
    5)
      update_local_release
      echo "Done. Quitting..."
      exit 0
      ;;
    6)
      push_new_version
      echo "Done. Quitting..."
      exit 0
      ;;
    7)
      configure_dist
      exit 0
      ;;
    8)
      clean_projects
      exit 0
      ;;
    9)
      echo "Restarting..."
      cd "$build_dir"
      docker-compose down -v
      docker-compose up -d
      exit 0
      ;;
    10)
      echo "Creating PBC..."
      create_pbc
      exit 0
      ;;
    11)
      delete_module
      exit 0
      ;;
    12)
      set_codename
      echo "Now you can build the project or run a pre-compiled version."

      ;;
    13)
      echo "Quitting..."
      exit 0
      ;;
    *)
      echo "Invalid option, please select a valid option number."
      ;;
  esac
done
