const path = require("path");
const express = require("express");

const configViewEngine = (app) => {
  // Set thư mục views
  app.set("views", path.join(__dirname, "..", "views"));

  // Set view engine EJS
  app.set("view engine", "ejs");

  // Config static files (css/js/images)
  app.use(express.static(path.join(__dirname, "..", "public")));
};

module.exports = configViewEngine;
