const fs = require("fs");
const os = require("os");
const path = require("path");
const checker = require("license-checker");
const fse = require("fs-extra");
const dotenv = require("dotenv");
dotenv.config();

// /registry
const currentWorkingDir = process.cwd();

// Framework root folder
const pathRootDir = path.dirname(path.dirname(currentWorkingDir));

// Where registry modules are located
const pathCapabilitiesDir = path.join(pathRootDir, "Digital-Twin-Capabilities");

// Build output dir
const pathDistributionDir = path.join(pathRootDir, "Digital-Twin-Distribution");

// Where framework config is stored
const registryConfigDir = path.join(currentWorkingDir, "config");

// Where framework data (scripts, doc, etc) is stored
const pathDataDir = path.join(currentWorkingDir, "data");

// Where framework documentation is stored
const pathSourceDocDir = path.join(pathRootDir, "Digital-Twin-Registry", "docs");

// Path to the .env-template file template
const pathEnvTemplate = path.join(pathDataDir, ".env-template");

// TODO: Specify the path to the .env file
const pathEnvFile = path.join(currentWorkingDir, "bin", ".env");

const rootProjectIds = ["pbcApp", "pbcRegistry"];

/**
 * Returns the file path for a given filename in the release directory
 * @param {string} filename - The name of the file to get the path for
 * @returns {string} - The file path for the given file in the release directory
 */
const getDigitalTwinFile = (codename, filename) => {
  return path.join(pathRootDir, "Digital-Twin-Apps", codename, "config", filename);
};

/**
 * Returns the file path for a given filename in the distribution directory
 * @param {string} filename - The name of the file to get the path for
 * @returns {string} - The file path for the given file in the distribution directory
 */

const getDistributionPath = (filename) => {
  return path.join(pathDistributionDir, ...filename);
};

/**
 * Gets the IP address of the machine running the script
 * @param {string|null} force - A forced IP address to use instead of the detected one (optional)
 * @returns {string} - The IP address of the machine
 */
const getMachineIP = (force) => {
  const machineIps = Object.values(os.networkInterfaces())
    .reduce(
      (ips, iface) =>
        ips.concat(
          iface
            .filter((entry) => entry.family === "IPv4" && !entry.internal)
            .map((entry) => entry.address),
        ),
      [],
    )
    .filter((ip) => ip.includes("192.168."));

  return force ?? machineIps[0];
};

/**
 * Prepares projects for a given release version by setting `machineIp` and `machineTLD`, updating the `replaces`
 * array with any necessary string replacements, and calling `configureAppModules()`.
 */
const updateEnv = (appManifest) => {
  const envContents = fs.readFileSync(pathEnvFile, "utf8");
  const envLines = envContents.split("\n");

  const updatedEnvLines = envLines.map((line) => {
    if (line.startsWith("DIGITAL_TWIN_REGISTRY=")) {
      const value = appManifest.dockerRegistry;
      return `DIGITAL_TWIN_REGISTRY=${value}`;
    }

    const ip = getMachineIP();
    if (line.startsWith("DIGITAL_TWIN_HOST=") && ip) {
      return `DIGITAL_TWIN_HOST=${ip}`;
    }

    if (line.startsWith("DIGITAL_TWIN_VERSION=") && appManifest.version) {
      return `DIGITAL_TWIN_VERSION=${appManifest.version}`;
    }
    return line;
  });

  const updatedEnvContents = updatedEnvLines.join("\n");
  fs.writeFileSync(pathEnvFile, updatedEnvContents, "utf8");

  // Reload
  const envConfig = dotenv.parse(fs.readFileSync(pathEnvFile));
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }

  return envConfig;
};

/**
 * Updates the remote URL and base URL for a given project based on its configuration
 * @param {Object} project - The project object to update
 * @param {string} basePath - The path to use as the base URL
 */
const updateURLs = (project, machineTLD, basePath) => {
  if (project.routeCapabilities) project.remote = machineTLD + basePath + project.routeCapabilities;

  project.url = machineTLD + basePath;

  // If the project is a main app, update the remote URL to exclude the proxy path
  if (project.appManifest) {
    if (project.routeCapabilities) project.remote = machineTLD + project.routeCapabilities;
  }
  if (project.url.endsWith("/models")) project.url += "/v1";
};

/**
 * Generates a proxy configuration file based on the master registry
 */
const generateProxyConfig = (registry) => {
  // Initialize containers and locations arrays
  const locations = [];
  const upstreamLocations = [];

  // Searches first on project/config folder for proxy.conf then in registry folder
  const getProxyConfigFile = (project) => {
    const root = getProjectRoot(project);
    let def = `${root}/config/proxy.config`;
    if (fs.existsSync(def)) return def;
    return null;
  };

  // Import static definitions
  const { manifest } = getAppManifest(registry);

  // Read in proxy configuration file and replace placeholders with generated entries
  const proxyConfigFile = `${getProjectRoot(registry["proxy"])}/proxy.conf`;

  if (!fs.existsSync(proxyConfigFile)) {
    console.log("[GenerateProxyConfig] Proxy file template is missing: ${proxyConfig}.");
    return;
  } else {
    manifest.modules.forEach((m) => {
      const project = registry[m.id];
      if (!project || !project.enableProxy) return;

      const container = project.dockerContainer;
      const upstream_name = `$upstream_${container.replace(/-/g, "_")}`;
      upstreamLocations.push(`  set ${upstream_name} "${container}";`);

      const def = getProxyConfigFile(project);
      if (def) {
        locations.push(fs.readFileSync(def).toString());
      } else if (project.proxyPath !== "/") {
        // If the project is configured for proxy, generate location entry and add to containers/locations arrays
        const url = project.proxyPath.substr(0, project.proxyPath.length);
        locations.push(`\
  location ${url}/ {\n\
    rewrite ^${url}/(.*)$ /$1 break;\n\
    rewrite ^${url}(.*)$ /$1 break;\n\
    if ($request_uri !~* \\.\\w+$) {\n\
        rewrite ^/(.*)$ / break;\n\
    }\n\
    proxy_read_timeout 520s;\n\
    proxy_set_header X-Forwarded-Host $http_host;\n\
    proxy_set_header X-Original-URI $request_uri;\n\
    proxy_pass http://${upstream_name}:${project.devServerPort};\n\
  }\n\
  `);
      }
    });

    const proxyConfig = fs
      .readFileSync(proxyConfigFile)
      .toString()
      .replace(/  @LOCATION_LIST/g, locations.join("\n"))
      .replace(/  @UPSTREAM_LIST/g, upstreamLocations.join("\n"))
      .replace(/@ENTRY_POINT/g, manifest.entrypoint);

    // Write final configuration file to build dir
    console.log(getDistributionPath(["build", "proxy.conf"]));
    fs.writeFileSync(getDistributionPath(["build", "proxy.conf"]), proxyConfig);
  }
};

/**
 * Get project root
 */
const getProjectRoot = (project) => {
  return rootProjectIds.includes(project.id)
    ? path.join(pathRootDir, project.rootDir)
    : path.join(pathCapabilitiesDir, project.rootDir);
};

/**
 * Updates the URL and base URL for a given project based on its configuration
 * @param {string} project - The project to update
 * @returns {Object} - The updated project object
 */
const updateProjectURL = (project, machineTLD) => {
  const projectRoot = getProjectRoot(project);
  try {
    const packageInfo = require(path.join(projectRoot, "package.json"));
    project.version = packageInfo.version;
  } catch (e) { }

  // Update URLs based on project configuration
  if (project.enableProxy) {
    // If a proxy is enabled, update both remote and base URLs with the proxy path and endpoint
    updateURLs(project, machineTLD, project.proxyPath);
  } else if (project.devServerPort) {
    // If the project has a dev server port, update remote and base URLs with the port and endpoint
    //project.enableProxy = false;
    updateURLs(project, machineTLD, ":" + ":" + project.devServerPort);
  }

  return project;
};

const generateEnvironment = (registry, id) => {
  const project = registry[id];
  const container = project.dockerContainer;
  const port = project.devServerPort;
  const ports = [];
  const environment = ["      - PORT=" + port];
  if (project.dockerEnvironment) {
    Object.keys(project.dockerEnvironment).forEach((key) => {
      const newKey = key.replace("${PORT}", port);
      const newValue = project.dockerEnvironment[key].replace("${PORT}", port);
      environment.push("      - " + newKey + "=" + newValue);
    });
  }

  if (project.dockerPorts) {
    Object.keys(project.dockerPorts).forEach((key) => {
      const newKey = key.replace("${PORT}", port);
      const newValue = project.dockerPorts[key].replace("${PORT}", port);
      ports.push("      - " + newKey + ":" + newValue);
    });
  }

  return (
    "    restart: unless-stopped\n\
    container_name: " +
    container +
    "\n\
    environment:\n" +
    environment.join("\n") +
    (ports.length > 0 ? "\n    ports:\n" + ports.join("\n") : "") +
    "\n    "
  );
};

const generateImageBuilder = (registry, id, canBuild) => {
  if (!canBuild) return "";
  const project = registry[id];

  // Searches first on project/config folder
  const getDockerFile = (project) => {
    const root = getProjectRoot(project);
    const dockerImage = project.dockerImage ?? "Dockerfile";

    // Search locally in module
    let def = `${root}/config/${dockerImage}`;
    if (fs.existsSync(def)) {
      // Convert to relative path
      return `${root.replace(pathRootDir, ".")}/config/${dockerImage}`;
    }

    // Search in registry
    def = `${pathDataDir}/docker/${dockerImage}`;
    if (fs.existsSync(def)) {
      // Convert to relative path
      return `${pathDataDir.replace(pathRootDir, ".")}/docker/${dockerImage}`;
    }

    return null;
  };

  // Digital-Twin-A => A, Digital-Twin => ""
  let m = project.rootDir.includes("Digital-Twin-")
    ? project.rootDir.split("Digital-Twin-")[1]
    : "";

  if (m.includes("Apps/")) m = m.replace("Apps/", "");

  const port = project.devServerPort;
  const file = getDockerFile(project);

  if (!file) {
    console.error(`Dockerfile for ${project.id} not found`);
    return "";
  }

  const dockerBuildImage = file.replace("\\", "/");
  return (
    "    build:\n\
      context: ../\n\
      dockerfile: " +
    dockerBuildImage +
    "\n\
      args:\n\
        MODULE: " +
    (m ? m : "") +
    "\n\
        PORT: " +
    port +
    "\n\
        HOSTNAME: ${DIGITAL_TWIN_HOST}\n\
        CODENAME: ${DIGITAL_TWIN_CODENAME}\n"
  );
};

const generateModuleHeaders = (registry, id, canBuild) => {
  const project = registry[id];
  const container = project.dockerContainer;
  const imageName = "${DIGITAL_TWIN_REGISTRY}" + container + "-${DIGITAL_TWIN_VERSION}";
  return (
    "\
  # Digital Twin: " +
    project.label +
    "\n\
  " +
    container +
    ':\n\
    image: "' +
    imageName +
    '"\n' +
    generateImageBuilder(registry, id, canBuild)
  );
};

const generateDependsOn = (registry, id) => {
  const project = registry[id];
  let depends = "depends_on:\n      digital-twin-proxy:\n        condition: service_started";
  project?.remotes?.forEach((dependency) => {
    if (registry[dependency]) {
      depends += `\n      ${registry[dependency].dockerContainer}:\n        condition: service_healthy`;
    } else {
      console.error(`Error: ${id} requires ${dependency}`);
    }
  });
  return depends + "\n";
};

const generateNetworks = (id, envs) => {
  if (envs.DIGITAL_TWIN_NETWORK_MODE !== "off") {
    if (id === "proxy") return '    network_mode: "' + envs.DIGITAL_TWIN_NETWORK_MODE + '"\n';
    return "";
  }
  if (envs.DIGITAL_TWIN_ENABLE_NETWORKS !== "true") return "";
  return "    networks:\n\
      - public-network\n\
      - docker-network\n";
};

const createNetworks = (envs) => {
  if (envs.DIGITAL_TWIN_ENABLE_NETWORKS !== "true") return "";
  return "\nnetworks:\n\
  public-network:\n\
    name: public-network\n\
    driver: bridge\n\
  docker-network:\n\
    name: docker-network\n\
    driver: bridge\n\
    internal: true\n";
};

const generateComposeOptions = (envs) => {
  if (envs.DIGITAL_TWIN_ENABLE_LOGGING_OPTIONS !== "true") return "";
  return '\
    logging:\n\
      options:\n\
        max-size: "5m"\n\
        max-file: "3"\n';
};

const generateHealthCheck = (registry, id) => {
  const project = registry[id];
  const port = project.devServerPort;
  if (project.dockerHealthCheck === false && !project.dockerHealthCheckEndpoint) return "";
  const url = project.dockerHealthCheckEndpoint
    ? project.dockerHealthCheckEndpoint.replace("${PORT}", port)
    : "http://localhost:" + port + "/" + id + "-dts.tgz";
  return (
    '    healthcheck:\n\
      test: ["CMD", "curl", "-f", "' +
    url +
    '"]\n\
      timeout: 60s\n\
      interval: 10s\n\
      retries: 10\n\
      start_period: 5s\n'
  );
};

const generateDockerCommand = (registry, id) => {
  const project = registry[id];
  if (!project?.dockerCommand) return "";
  return "\
    command: " + project.dockerCommand + " \n\
";
};

const generateResources = (registry, id) => {
  const project = registry[id];
  if (!project?.resources) return "";
  return "\
    privileged: true\n\
    deploy:\n\
      resources:\n\
        reservations:\n\
          devices:\n\
            - driver: nvidia\n\
              count: 1\n\
              capabilities: [gpu]\n\
    ulimits:\n\
      memlock: -1\n\
      stack: 67108864\n\
    shm_size: '1gb' \n\
";
};

const generateDNS = (registry, id, envs) => {
  if (envs.DIGITAL_TWIN_ENABLE_DNS !== "true") return "";
  const project = registry[id];
  const dns = project.dns ?? ["8.8.8.8", "4.4.4.4", "192.168.0.34"];
  return "    dns:\n" + dns.map((ip) => "      - " + ip + "\n").join("");
};

const generateModuleVolumes = (registry, id) => {
  const project = registry[id];
  if (!project.dockerVolumes || project.dockerVolumes.length === 0) return "";
  return (
    "    volumes:\n" +
    project.dockerVolumes.map((v) => "      - " + v.source + ":" + v.target).join("\n") +
    "\n"
  );
};

const generateDockerComposeModule = (registry, id, canBuild, envs) => {
  console.log("Generating docker compose for " + id);
  const project = registry[id];

  if (!project) return;

  // Searches first on project/config folder for proxy.conf then in registry folder
  const getComposeTemplateFile = (project) => {
    const root = getProjectRoot(project);

    const version = canBuild ? "-builder" : "";
    let def = `${root}/config/docker-compose${version}.config`;
    if (fs.existsSync(def)) return def;

    def = `${root}/config/docker-compose.config`;
    if (fs.existsSync(def)) return def;

    const container = project.dockerContainer;
    def = `${pathDataDir}/docker-compose/${container}${version}.config`;
    if (fs.existsSync(def)) return def;

    def = `${pathDataDir}/docker-compose/${container}.config`;
    if (fs.existsSync(def)) return def;

    return null;
  };

  const updateDockerComposeFile = (def) => {
    let file = fs.readFileSync(def).toString();
    file = file.replace(/@@CONFIG@@/g, options);
    if (envs.DIGITAL_TWIN_NETWORK_MODE !== "off") {
      file = file.replace("ports:", "").replace(/([\t\s]+)- "80:80"/g, "");
    }
    return file;
  };

  const options =
    generateNetworks(id, envs) + generateDNS(registry, id, envs) + generateComposeOptions(envs);

  const def = getComposeTemplateFile(project);
  if (def) {
    return updateDockerComposeFile(def);
  }

  return (
    generateModuleHeaders(registry, id, canBuild) +
    generateEnvironment(registry, id) +
    generateDependsOn(registry, id) +
    generateModuleVolumes(registry, id) +
    generateHealthCheck(registry, id) +
    generateResources(registry, id) +
    generateDockerCommand(registry, id) +
    options
  );
};

const generateVolumes = (registry) => {
  const { manifest } = getAppManifest(registry);
  const volumes = manifest.modules
    .map((m) => {
      const project = registry[m.id];
      if (!project || !project.dockerVolumes) return "";
      return project.dockerVolumes
        .filter((v) => v.create)
        .map(
          (v) =>
            "\n  " +
            v.source +
            ":\n\
      driver: local",
        )
        .join("\n");
    })
    .filter((v) => v !== "")
    .join("");
  return volumes.length > 0 ? "volumes:" + volumes : "";
};

/**
 * Generates a Docker Compose file for the digital-twin project's modules.
 */

const generateDockerCompose = (registry, envs) => {
  const { manifest } = getAppManifest(registry);
  const modules = (canBuild) =>
    manifest.modules
      .map((m) => {
        return generateDockerComposeModule(registry, m.id, canBuild, envs);
      })
      .join("\n");

  function generateDockerComposeFile(tmpl, canBuild) {
    let t = tmpl
      .replace(
        /  ## AUTOGENERATED SERVICES/g,
        modules(canBuild).replace(/@@VERSION@@/g, envs.DIGITAL_TWIN_VERSION),
      )
      .replace(/  ## AUTOGENERATED VOLUMES/g, generateVolumes(registry));
    if (canBuild) t = t.replace(/context: ../g, "context: ../..");

    let output = t + createNetworks(envs);
    if (envs.DIGITAL_TWIN_PROXY_PORT)
      output = output.replace('- "80:80"', '- "' + envs.DIGITAL_TWIN_PROXY_PORT + ':80"');

    return output;
  }

  let tmpl = fs.readFileSync(`${pathDataDir}/docker-compose/docker-compose.yml`).toString();
  fs.writeFileSync(
    getDistributionPath(["build", "docker-compose.builder.yml"]),
    generateDockerComposeFile(tmpl, true),
  );
  fs.writeFileSync(
    getDistributionPath(["build", "docker-compose.yml"]),
    generateDockerComposeFile(tmpl, false),
  );

  function generateDeployFile() {
    let s = fs.readFileSync(`${pathDataDir}/docker-compose/deploy.sh`).toString();
    const d = manifest.modules
      .map((m) => {
        const project = registry[m.id];
        if (!project) return "";
        const container = project.dockerContainer;
        const isRequired = manifest.modules.some((s) => registry[s.id]?.remotes?.includes(m.id));
        const dockerDependencyContainers = project.dockerDependencyContainers
          ? [...project.dockerDependencyContainers, container]
          : [container];
        return [
          ...dockerDependencyContainers.map(
            (c) => "docker-compose -f docker-compose.builder.yml build " + c,
          ),
          "docker-compose -f docker-compose.yml up -d --remove-orphans " + container,
          isRequired ? `check_container_health "` + container + `"\n` : "",
        ].join("\n");
      })
      .join("\n");
    return s + d;
  }

  fs.writeFileSync(getDistributionPath(["build", "service_deploy.sh"]), generateDeployFile());

  function generateUpdateReleaseFile() {
    return [
      "#!/bin/bash",
      "set -e",
      "docker-compose pull",
      "docker-compose up -d",
      "docker restart $(docker ps -q)",
    ].join("\n");
  }

  fs.writeFileSync(
    getDistributionPath(["build", "service_update.sh"]),
    generateUpdateReleaseFile(),
  );
};

/**
 * Generates a new registry file by replacing specified strings, and writes it to disk. Also updates all relevant
 * projects with the new registry.
 */
const generateRegistry = (registry, modules, envs) => {
  const hostname = envs.DIGITAL_TWIN_HOSTNAME;
  const httpProtocol = envs.DIGITAL_TWIN_HTTP_PROTOCOL;
  const wsProtocol = envs.DIGITAL_TWIN_WS_PROTOCOL;
  const codename = envs.DIGITAL_TWIN_CODENAME;
  const replaces = [
    {
      a: "http://localhost:3101",
      b: httpProtocol + hostname + "/api",
    },
    {
      a: "ws://localhost:3101",
      b: wsProtocol + hostname + "/ws",
    },
    {
      a: "http://localhost:80",
      b: httpProtocol + hostname,
    },
    {
      a: httpProtocol + hostname + ":80",
      b: httpProtocol + hostname,
    },
    {
      a: httpProtocol + hostname + "::80",
      b: httpProtocol + hostname,
    },
  ];

  const addLeadingZero = (value) => {
    return value < 10 ? "0" + value : value;
  };

  const getCurrentDateTime = () => {
    var now = new Date();
    var day = now.getDate();
    var month = now.getMonth() + 1; // Months are zero-based
    var year = now.getFullYear();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    // Add leading zeros if necessary
    day = addLeadingZero(day);
    month = addLeadingZero(month);
    hours = addLeadingZero(hours);
    minutes = addLeadingZero(minutes);
    seconds = addLeadingZero(seconds);

    const formattedDateTime =
      day + "." + month + "." + year + "/" + hours + "." + minutes + "." + seconds;
    return formattedDateTime;
  };

  const version = getCurrentDateTime();

  const { manifest } = getAppManifest(registry);
  manifest.id = codename;
  registry["pbcApp"].version = version;

  // Convert registry to JSON string with pretty formatting
  let json = JSON.stringify(registry, null, 2);

  // Iterate over each replacement and perform it on the JSON string
  console.log("Applying user replaces...");
  replaces.forEach(({ a, b }) => {
    console.log("Replacing " + a + " with " + b);
    json = json.split(a).join(b);
  });

  // Setup registry
  fs.writeFileSync(path.resolve(pathDataDir, "modules.json"), JSON.stringify(modules, null, 2));
  fs.writeFileSync(
    path.resolve(registryConfigDir, "modules.json"),
    JSON.stringify(modules, null, 2),
  );
  fs.writeFileSync(path.resolve(pathDataDir, "config.json"), json);
  fs.writeFileSync(path.resolve(registryConfigDir, "config.json"), json);
  return registry;
};

/**
 * Copies all translation files from the public/locales directory to the Digital-Twin-UX/src/services/i18n/locales
 * directory.
 */
const generateTranslations = (codename) => {
  console.log("Updating translation files");
  const sourceDir = path.resolve(pathRootDir, "Digital-Twin-Apps", codename, "public", "locales");
  const targetDir = path.resolve(
    pathCapabilitiesDir,
    "Digital-Twin-UX",
    "src",
    "providers",
    "i18n",
    "locales",
  );

  try {
    fse.removeSync(targetDir);
  } catch (e) { }

  if (fs.existsSync(sourceDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    fs.readdirSync(sourceDir).forEach((file) => {
      const srcFilePath = path.join(sourceDir, file);
      const destFilePath = path.join(targetDir, file);
      fs.copyFileSync(srcFilePath, destFilePath);
    });
  }
};

/**
 * Copies a set of files from the Digital-Twin-Apps/* directory to the distribution dir
 * directory, effectively updating the distribution files.
 */
const generateDist = (registry) => {
  const { manifest } = getAppManifest(registry);
  console.log("Updating dist files for " + manifest.id);

  const replaceText = (text, toc) => {
    let data = text.replace(/@@PROJECT_NAME@@/g, manifest.id);
    data = data.replace(/@@PROJECT_NAME_LOWERCASE@@/g, manifest.id.toLowerCase());
    data = data.replace(/@@PROJECT_DESCRIPTION@@/g, manifest.description);
    data = data.replace(/@@DOCUMENTATION_MODULES@@/g, toc.join("\n"));
    data = data.replace(/@@DIGITAL_TWIN_REGISTRY@@/g, process.env.DIGITAL_TWIN_REGISTRY);
    data = data.replace(
      /@@KEYCLOAK_FRONTEND_URL@@/g,
      process.env.DIGITAL_TWIN_HTTP_PROTOCOL +
      process.env.DIGITAL_TWIN_HOSTNAME +
      process.env.KEYCLOAK_FRONTEND_URL,
    );
    return data;
  };

  // Generate README for each PBC
  const toc = [];
  manifest.modules.forEach((m) => {
    const project = registry[m.id];
    if (project?.rootDir) {
      const readmePath = path.resolve(pathCapabilitiesDir, project.rootDir, "README.md");
      if (fs.existsSync(readmePath))
        try {
          toc.push("- [" + project.label + "](./" + project.documentation + ")");
          fs.copyFileSync(
            readmePath,
            getDistributionPath(["documentation", project.documentation]),
          );
        } catch (e) { }
    }
  });

  // Other documentation documents for the release
  ["FAQ"].forEach((file) => {
    const filepath = path.join(pathRootDir, "Digital-Twin-Documentation", `${file}.md`);
    if (fs.existsSync(filepath)) {
      let data = fs.readFileSync(filepath).toString();
      toc.push(`- [${file}](./${file}.md)`);
      data = replaceText(data, toc);
      fs.writeFileSync(getDistributionPath(["documentation", `${file}.md`]), data);
    }
  });

  // Distribution README
  const filepath = path.join(
    pathRootDir,
    "Digital-Twin-Documentation",
    "DistributionUsageGuide.md",
  );
  if (fs.existsSync(filepath)) {
    let data = fs.readFileSync(filepath).toString();
    const instructions = [];
    manifest.modules.forEach((m, i) => {
      const project = registry[m.id];
      if (project) {
        const container = project.dockerContainer;
        if (!m.build) {
          instructions.push(i + 1 + ". Start the `" + project.label + "` container");
          instructions.push("    ```");
          instructions.push("     docker-compose up -d " + container);
          instructions.push("    ```");
        } else {
          instructions.push(
            i +
            1 +
            ". The following command will compile the `" +
            project.label +
            "` module from your Git project and push the resulting Docker image to your Docker registry.",
          );
          instructions.push("    ```");
          instructions.push(
            "     docker-compose build " + container + " && docker-compose push " + container,
          );
          instructions.push("    ```");

          instructions.push(
            "    On the server where the service will be deployed (which can be the same machine), start the new container to allow subsequent containers in the chain to connect to it and build all the necessary features.",
          );

          instructions.push("    ```");
          instructions.push(
            "     docker-compose pull " + container + " && docker-compose up -d " + container,
          );
          instructions.push("    ```");
        }
      }
    });
    data = replaceText(data, toc);
    data = data.replace(/@@BUILD_INSTRUCTIONS@@/g, instructions.join("\n"));
    fs.writeFileSync(getDistributionPath(["documentation", "DEVELOPMENT.md"]), data);
  }

  try {
    fs.copyFileSync(pathEnvFile, getDistributionPath(["build", ".env"]));
  } catch (e) { }

  try {
    fs.copyFileSync(
      `${pathDataDir}/installer/services-config.sh`,
      getDistributionPath(["build", "services-config.sh"]),
    );
    fs.copyFileSync(`${pathDataDir}/installer/pack.sh`, getDistributionPath(["build", "pack.sh"]));
  } catch (e) { }
};

/**
 * Updates modules with data from app manifest.
 */
const configureAppModules = (data) => {
  console.log("Configuring modules...");
  const { registry, modules } = data;
  const { manifest } = getAppManifest(registry);
  const envs = updateEnv(manifest);
  const hostname = envs.DIGITAL_TWIN_HOSTNAME;
  const httpProtocol = envs.DIGITAL_TWIN_HTTP_PROTOCOL;
  const wsProtocol = envs.DIGITAL_TWIN_WS_PROTOCOL;
  const apiHostname = envs.SWAGGER_API_HOSTNAME;
  const swaggerPath = envs.SWAGGER_API_PATH;
  const codename = envs.DIGITAL_TWIN_CODENAME;
  const version = envs.DIGITAL_TWIN_VERSION;

  console.log(`Preparing build for ${codename} ${version} ${hostname}`);

  const machineTLD = httpProtocol + hostname;
  if (registry["pbcNoSQL"]) {
    registry["pbcNoSQL"].microservices.swagger.url = httpProtocol + apiHostname + swaggerPath;
    registry["pbcNoSQL"].microservices.sockets.url = wsProtocol + apiHostname + "/ws";
  }

  const promises = manifest.modules.map((m) => {
    console.log("Updating " + m.id);
    if (registry[m.id] === undefined) {
      console.log("Project '" + m.id + "' is missing");
      return Promise.resolve(); // skip this project
    }

    // Update project URL in registry
    const project = updateProjectURL(registry[m.id], machineTLD);
    registry[m.id] = project;

    // If project has a root directory, get its licenses
    if (project.rootDir && fs.existsSync(path.join(pathCapabilitiesDir, project.rootDir))) {
      const projectPath = path.resolve(path.join(pathCapabilitiesDir, project.rootDir));
      return new Promise((resolve) => {
        checker.init({ start: projectPath }, (error, projectLicenses) => {
          if (error) {
            console.error(`Error getting licenses for ${project.label}: ${error.message}`);
            resolve();
          }
          // Extract license information from projectLicenses and add it to the project in the registry
          registry[m.id].licenses = Object.entries(projectLicenses)
            .filter(([key, value]) => !value.development)
            .map(([key, value]) => ({
              library: key,
              license: value.licenses,
              author: value.publisher,
              url: value.repository,
            }));

          resolve();
        });
      });
    } else {
      return Promise.resolve(); // skip this project
    }
  });

  // After all promises have resolved, generate various configuration files
  Promise.all(promises)
    .then(() => {
      generateProxyConfig(registry);
      generateDockerCompose(registry, envs);
      generateRegistry(registry, modules, envs);
      generateTranslations(envs.DIGITAL_TWIN_CODENAME);
      generateDist(registry);
      createDigitalTwinSchema();
    })
    .catch((error) => {
      console.error(`Error: ${error.message}`, error);
    });
};

const createDigitalTwinSchema = () => {
  (async () => {
    const { createGenerator } = await import("ts-json-schema-generator");

    const config = {
      path: "../src/types/RegistryDefinition.tsx",
      tsconfig: "../tsconfig.json",
    };

    // Support for old node versions
    global.structuredClone = (v) => JSON.parse(JSON.stringify(v));

    // Generate the schema
    const generator = createGenerator(config);

    ["Module", "Microservice", "Microfrontend", "OtherService", "DigitalTwin"].forEach((type) => {
      try {
        fs.writeFileSync(
          path.resolve(`./data/schema/${type.toLocaleLowerCase()}.json`),
          JSON.stringify(generator.createSchema(type), null, 2),
        );
      } catch (e) {
        console.log(`"${type}" type not found in ${config.path}`);
      }
    });
  })();
};

const createAppBuildProject = () => {
  try {
    if (!fse.existsSync(pathEnvFile)) {
      console.log("Creating .env ...");
      try {
        fse.copySync(pathEnvTemplate, pathEnvFile);
      } catch (error) {
        console.error("Error copying .env file");
      }
    }

    const envs = dotenv.parse(fs.readFileSync(pathEnvFile));
    const codename = envs.DIGITAL_TWIN_CODENAME;
    if (!codename) return false;

    const hostMachine =
      envs.DIGITAL_TWIN_HOST !== "" ? envs.DIGITAL_TWIN_HOST : getMachineIP() ?? "localhost";
    const registry = getAppRegistry(hostMachine, codename);

    console.log(`Root: ${pathRootDir}`);
    console.log(`Capabilities: ${pathCapabilitiesDir}`);
    console.log(`Modules: ${currentWorkingDir}/config/modules.json`);
    console.log(`Registry: ${getDigitalTwinFile(codename, "module.json")}`);

    const pathAppSchema = path.join(pathRootDir, "Digital-Twin-Apps", codename, "data");
    const pathAppSchemaIndex = path.join(pathAppSchema, "schema.json");
    const pathAppSchemaEndpoints = path.join(pathAppSchema, "schema", "endpoints");

    if (fse.existsSync(pathAppSchemaIndex)) {

      // Copy DB schema to services PBC
      const pathServices = path.join(pathCapabilitiesDir, "Digital-Twin-Services");
      if (fse.existsSync(pathServices)) {
        try {
          console.log("Updating project Services schema...");
          const targetSchemaFolder = path.join(pathServices, "src", "schema");
          fse.removeSync(targetSchemaFolder);
          fse.copySync(path.join(pathAppSchemaIndex), path.join(pathServices, "config", "schema.json"));
          fse.copySync(
            path.join(pathAppSchemaEndpoints, "microservice", "schema"),
            path.join(targetSchemaFolder),
          );
        } catch (err) {
          console.error("[PrepareBuildDirectories]: Error updating services folder", err);
        }
      }

      // Copy DB schema to RestDB PBC
      const pathDb = path.join(pathCapabilitiesDir, "Digital-Twin-RestDB");
      if (fse.existsSync(pathDb)) {
        try {
          console.log("Updating project RestDB schema...");
          const targetSchemaFolder = path.join(pathDb, "src", "endpoints", "microservice");
          fse.removeSync(path.join(targetSchemaFolder, "schema"));
          fse.removeSync(path.join(targetSchemaFolder, "paths"));
          fse.copySync(path.join(pathAppSchemaIndex), path.join(pathDb, "config", "schema.json"));
          fse.copySync(
            path.join(pathAppSchemaEndpoints, "microservice", "schema", "core"),
            path.join(targetSchemaFolder, "schema", "core")
          );
          fse.copySync(
            path.join(pathAppSchemaEndpoints, "microservice", "schema", "util"),
            path.join(targetSchemaFolder, "schema", "util")
          );
          fse.copySync(
            path.join(pathAppSchemaEndpoints, "microservice", "paths", "core"),
            path.join(targetSchemaFolder, "paths", "core")
          );
        } catch (err) {
          console.error("[PrepareBuildDirectories]: Error updating services folder", err);
        }
      }
    }

    console.log("Creating distribution directory...");
    const targetDir = path.join(pathDistributionDir, "build", "data-models");
    if (!fse.existsSync(targetDir)) {
      fse
        .mkdirp(targetDir, { force: true })
        .then(() => {
          const sourceDir = path.join(
            pathRootDir,
            "Digital-Twin-Apps",
            codename,
            "data",
            "data-models",
          );
          if (fse.existsSync(sourceDir)) fse.copySync(sourceDir, targetDir);
        })
        .catch((err) => {
          console.error("Error creating directory:", err);
        });
    }

    console.log("Creating documentation directory...");
    const docDir = path.join(pathDistributionDir, "documentation");
    if (!fse.existsSync(docDir)) {
      fse
        .mkdirp(docDir, { force: true })
        .then()
        .catch((err) => {
          console.error("Error creating directory:", err);
        });
    }

    console.log("Creating keys directory...");
    const targetKeysDir = path.join(pathDistributionDir, "build", "ssh-keys");
    if (!fse.existsSync(targetDir)) {
      fse
        .mkdirp(targetKeysDir, { force: true })
        .then(() => {
          const sourceDir = path.join(pathRootDir, "Digital-Twin-Registry", "registry", "ssh-keys");
          fse.copySync(sourceDir, targetKeysDir);
        })
        .catch((err) => {
          console.error("Error creating directory:", err);
        });
    }

    return registry;
  } catch (e) {
    console.error("[PrepareBuildDirectories]: " + e.message);
  }
  return false;
};

const getAppManifest = (registry) => {
  const app = Object.keys(registry).find((key) => registry[key].appManifest !== undefined);
  if (!app) return null;
  return { key: registry[app].id, manifest: registry[app].appManifest };
};

// List of modules available in the system
const getCapabilityModules = (devIp) => {
  const registry = {};
  registry["pbcRegistry"] = require(`${pathRootDir}/Digital-Twin-Registry/config/module.json`);
  const files = fs.readdirSync(pathCapabilitiesDir);
  files.forEach((folder) => {
    const folderPath = path.join(pathCapabilitiesDir, folder);
    if (!fs.existsSync(`${folderPath}/config/module.json`)) return;
    const m = require(`${folderPath}/config/module.json`);
    m.devServerHost = `http://${devIp}`;
    m.devRegistryURL = `http://${devIp}/registry`;
    registry[m.id] = m;
    fs.writeFileSync(`${folderPath}/config/module.json`, JSON.stringify(m, null, 2));
  });
  return registry;
};

const getAppRegistry = (devIp, codename) => {
  console.log("Generating registry...");
  const appManifestFile = getDigitalTwinFile(codename, "module.json");
  if (!fs.existsSync(appManifestFile)) {
    console.log("[GetRegistryFromManifest]: Cannot find app manifest from " + appManifestFile);
    return;
  }

  // Get app manifest
  const app = require(appManifestFile);
  app.devServerHost = `http://${devIp}`;
  app.devRegistryURL = `http://${devIp}/registry`;
  fs.writeFileSync(appManifestFile, JSON.stringify(app, null, 2));

  const manifest = app.appManifest;
  const registry = {};

  // List possible capability modules
  const moduleList = getCapabilityModules(devIp);

  // Add required modules to registry
  manifest.modules.map((m) => {
    if (m.id === "pbcApp") return; // We will add this pbc at the end, to sort deps
    if (moduleList[m.id] === undefined) {
      console.log("[GetAppRegistry] Project '" + m.id + "' is missing");
    } else {
      registry[m.id] = moduleList[m.id];
      registry[m.id].id = m.id;
    }
  });

  registry[app.id] = app;
  return { registry, modules: moduleList };
};

const configBuild = () => {
  try {
    const registry = createAppBuildProject();
    if (registry) {
      configureAppModules(registry);
    } else console.log("[ConfigBuild]: Configuration is incomplete");
  } catch (e) {
    console.error("[ConfigBuild]: ", e);
  }
};

configBuild();
