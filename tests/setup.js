const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');

module.exports = async () => {
  // Create a new server instance specifically for testing
  const server = app.listen(0); // Port 0 lets the OS assign an available port
  global.__SERVER__ = server;
};
