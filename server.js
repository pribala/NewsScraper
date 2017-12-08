// Require all necessary npm packages 
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/recipes", {
  useMongoClient: true
});

// Routes

// A GET route for scraping the Minimalistic Baker website
app.get("/scrape", function(req, res) {
  
  // First, we grab the body of the html with request
  axios.get("https://www.wsj.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    
    // Now, we grab every article tag, and do the following:
    $(".wsj-card").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.headLine = $(this).find('.wsj-headline').text();
      result.urlLink = $(this).find('.wsj-headline').find('.wsj-headline-link').attr('href');
      result.summary = $(this).find('.wsj-card-body').find('.wsj-summary').text();
      // Create a new Article using the `result` object built from scraping
      db.Article
        .create(result)
        .then(function(dbArticle) {
        	// If we were able to successfully scrape and save an Article, send a message to the client
          console.log('scrape complete', dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
    });
    res.send('Scrape Complete');
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grabs all of the articles
  db.Article
    .find({})
    .then(function(dbArticle) {
      // If all Articles are successfully found, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});


  