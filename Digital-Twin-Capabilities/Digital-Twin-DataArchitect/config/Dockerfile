FROM nodered/node-red

# Install additional Node-RED packages
RUN npm install node-red-node-mongodb node-red-node-mysql @node-red-contrib-themes/theme-collection

ADD Digital-Twin-Capabilities/Digital-Twin-DataArchitect/settings.js /data
ADD Digital-Twin-Capabilities/Digital-Twin-DataArchitect/node-red-256.svg /usr/src/node-red/node_modules/@node-red/editor-client/public/red/images

# Settings file  : /data/settings.js
# Flows file     : /data/flows.json
