const path = require('path');
const Keycloak = require('keycloak-connect');
const Jwt = require('jsonwebtoken');
const fs = require('fs');

const getRegistry = () => {
  let moduleInfo = {};
  let registryInfo = null;

  try {
    moduleInfo = require('./config/module.json');
  } catch (error) {
    console.error('Error loading module information:', error);
  }

  try {
    registryInfo = require('./registry/config.json');
    console.log('Loaded registry from shared volume');
  } catch (error) { }

  const localRegistryPath = path.join(__dirname, '..', '..', 'Digital-Twin-Registry', 'registry', 'config', 'config.json');
  if (!registryInfo && fs.existsSync(localRegistryPath)) {
    try {
      registryInfo = require(localRegistryPath);
      console.log('Loaded registry from local project');
    } catch (error) { }
  }

  if (!registryInfo) {
    console.log('Failed to load registry');
    registryInfo = {};
  } else {
    console.log('Registry projects:', Object.keys(registryInfo).join(', '));
  }

  const config = registryInfo[moduleInfo.id] || moduleInfo;
  const appConfig = Object.values(registryInfo).find(t => t.appManifest);

  return { config, registry: registryInfo, app: appConfig };
};

const { config, registry, app } = getRegistry();

const authMiddleware = (req, res, next) => {
  const keycloakConfig = registry?.keycloak?.config;
  if (!keycloakConfig || app?.config?.authentication !== 'keycloak') {
    next();
    return;
  }

  const authorizationHeader = req.headers?.authorization;
  if (!authorizationHeader) {
    res.status(401).json({ message: 'Token is required', authentication: 'Unauthorized' });
    return;
  }

  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token is required', authentication: 'Unauthorized' });
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

    keycloak.grantManager.validateAccessToken(token)
      .then(result => {
        if (result === false) {
          res.status(401).json({ message: 'Secret Token Invalid', authentication: 'Unauthorized' });
        } else {
          req.tokenInfo = Jwt.decode(result);
          next();
        }
      })
      .catch(err => {
        res.status(401).json({ error: 'Invalid token', details: err });
      });
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  port: process.env.PORT || 3000,
  uploadDir: path.join(__dirname, 'static'),
  maxSize: 300 * 1024 * 1024, // 300MB limit
  bodyParserOptions: {
    json: { extended: true, limit: '500mb' },
    urlencoded: { extended: true, limit: '500mb', parameterLimit: 500000 },
  },
  authMiddleware,
  config,
};
