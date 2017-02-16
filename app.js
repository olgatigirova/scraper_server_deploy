const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const config = require('config');

const app = express();
const serverPort = config.application.port;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: false
};

const spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
const swaggerDoc = jsyaml.safeLoad(spec);

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  app.use(middleware.swaggerMetadata());
  app.use(middleware.swaggerValidator());
  app.use(middleware.swaggerRouter(options));
  app.use(middleware.swaggerUi());

  http.createServer(app).listen(serverPort, function () {
    console.log('Server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
  });
});

module.exports = app;
