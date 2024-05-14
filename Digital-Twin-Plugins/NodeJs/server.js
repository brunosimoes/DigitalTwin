const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { port, bodyParserOptions, config, authMiddleware } = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json(bodyParserOptions.json));
app.use(bodyParser.urlencoded(bodyParserOptions.urlencoded));

// Destructure and provide default values
const {
  label = 'Microservice',
  version = '1.0.0',
  description = 'Microservice description',
  url = `http://localhost:${port}`
} = config;

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: label,
      version: version,
      description: description
    },
    servers: [
      {
        url: url
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Routes
app.use(require('./routes/version'));

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Endpoint to serve Swagger OpenAPI JSON
app.get('/capabilities', authMiddleware, (req, res) => {
  res.json(swaggerDocs);
});

// Swagger
app.use('/', authMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
