/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var chaiString = require('chai-string');
chai.use(chaiString);
var expect = chai.expect;
chai.config.includeStack = true;
var mockHelper = require("./helpers/mock_helper");
var sinon = require("sinon");
var express = require('express');
var request = require("supertest-as-promised");
var bodyParser = require('body-parser');
var path = require('path');

describe("Alexa", function() {
  var Alexa = require("../index");

  describe("app", function() {
    var app;
    var testServer;
    var testApp;

    beforeEach(function() {
      app = express();
      app.use(bodyParser.json());
      app.set('views', path.join(__dirname, 'views'));
      app.set('view engine', 'ejs');
      testApp = new Alexa.app("testApp");
      testServer = app.listen(3000);
    });

    afterEach(function() {
      testServer.close();
    });

    context("#express with checkCert=true", function() {
      beforeEach(function() {
        testApp.express({
          expressApp: app,
          router: express.Router(),
          checkCert: true,
          debug: false
        });
      });

      it("checks cert header", function() {
        var mockRequest = mockHelper.load("intent_request_airport_info.json");
        return request(testServer)
          .post('/testApp')
          .set('signaturecertchainurl', 'dummy')
          .set('signature', 'dummy')
          .send(mockRequest)
          .expect(401).then(function(res) {
            expect(res.body.status).to.equal("failure");
            expect(res.body.reason).to.equal("signature is not base64 encoded");
          });
      });
    });
  });
});
