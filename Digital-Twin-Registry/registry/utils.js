const path = require("path");
const fs = require("fs");
const Keycloak = require("keycloak-connect");
const Jwt = require("jsonwebtoken");

const getRegistry = () => {
  try {
    const basePath = path.join(__dirname, "config");
    const registry = JSON.parse(fs.readFileSync(path.join(basePath, "config.json"), "utf8"));
    return registry;
  } catch (e) {
    return null;
  }
};

const isAdminConsoleEnabled = () => {
  try {
    return getRegistry().pbcRegistry.config.enableAdminConsole;
  } catch (e) {
    return false;
  }
};

const resetRegistrySettings = (force) => {
  try {
    const basePath = path.join(__dirname, "config");
    const baseDataPath = path.join(__dirname, "data");
    if (force || !fs.existsSync(path.join(basePath, "config.json"))) {
      const data = fs.readFileSync(path.join(baseDataPath, "config.json"), "utf8");
      fs.writeFileSync(path.join(basePath, "config.json"), data);
    }
    if (force || !fs.existsSync(path.join(basePath, "modules.json"))) {
      const data = fs.readFileSync(path.join(baseDataPath, "modules.json"), "utf8");
      fs.writeFileSync(path.join(basePath, "modules.json"), data);
    }
    return null;
  } catch (e) {
    return "Cannot setup service with config.json and modules.json";
  }
};

// TODO: update this variable dynamically
const registry = getRegistry();
const app = Object.values(registry).find(t => t.appManifest);

const authMiddleware = (req, res, next) => {
  const keycloakConfig = registry?.keycloak?.config;
  if (!keycloakConfig || app?.config?.authentication !== "keycloak") {
    next();
    return;
  }

  const authorizationHeader = req.headers?.authorization;
  if (!authorizationHeader) {
    res.status(401).json({ message: "Token is required", authentication: "Unauthorized" });
    return;
  }

  const token = authorizationHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Token is required", authentication: "Unauthorized" });
    return;
  }

  try {
    const kcConfig = {
      clientId: keycloakConfig.KEYCLOAK_CLIENT_ID,
      bearerOnly: true,
      serverUrl: keycloakConfig.KEYCLOAK_SERVER_URL,
      realm: keycloakConfig.KEYCLOAK_REALM,
      credentials: {
        secret: keycloakConfig.KEYCLOAK_CLIENT_SECRET,
      },
    };

    const keycloak = new Keycloak({}, kcConfig);

    keycloak.grantManager
      .validateAccessToken(token)
      .then((result) => {
        if (result === false) {
          res.status(401).json({ message: "Secret Token Invalid", authentication: "Unauthorized" });
        } else {
          req.tokenInfo = Jwt.decode(result);
          next();
        }
      })
      .catch((err) => {
        res.status(401).json({ error: "Invalid token", details: err });
      });
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getRegistry,
  isAdminConsoleEnabled,
  resetRegistrySettings,
  authMiddleware
};
