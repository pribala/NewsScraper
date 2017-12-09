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
    var results = [];

    // Now, we grab every article tag, and do the following:
    $(".wsj-card").each(function(i, element) {
      // Save an empty result object
      //var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      // result.headLine = $(this).find('.wsj-headline').text();
      // result.urlLink = $(this).find('.wsj-headline').find('.wsj-headline-link').attr('href');
      // result.summary = $(this).find('.wsj-card-body').find('.wsj-summary').text();
      // Create a new Article using the `result` object built from scraping
      // db.Article
      //   .create(result)
      //   .then(function(dbArticle) {
      //   	// If we were able to successfully scrape and save an Article, send a message to the client
      //     console.log('scrape complete', dbArticle);
      //   })
      //   .catch(function(err) {
      //     // If an error occurred, send it to the client
      //     res.json(err);
      //   });
      var title = $(this).find('.wsj-headline').text();
      var link  = $(this).find('.wsj-headline').find('.wsj-headline-link').attr('href');
      var summary = $(this).find('.wsj-card-body').find('.wsj-summary').text();
      if(summary.length!==0){
        results.push({
          title: title,
          link: link,
          summary: summary
        });
      }
    });
    res.json(results);
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

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/article/:id",function(req,res){
  db.Article.findOne({"_id": req.params.id }).populate("note")
    .then(function(dbArticle) {
      // If any articles are found, send them to the client with any associated notes
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route for saving article to database
app.post("/api/article", function(req, res){
  // Save the request body as an object called article
  var article = req.body;

  db.Article.create(article, function(err, articledata){
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        // Duplicate name
         return res.send('Article already exists!');
      }
    }
    res.send("Artice Saved!");
  });
});

// Delete an article
app.delete("/delete/article/:id", function(req, res) {
  
  var id = req.params.id;
  //console.log(id);
  db.Article.deleteOne({ "_id": id }, 
    function(err, deleted) {
    // Log any errors if the server encounters one
    if (err) throw err;
       // Otherwise, send the result of this query to the browser
      res.send(deleted);
  });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find the article and push the new Note's _id to the Articles's `notes` array
      // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({_id: req.params.id}, { $push: { note: dbNote._id } }, { new: true });
    })
    .then(function(dbArticle) {
      // If the Article was updated successfully, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Delete a note
app.delete("/delete/note/:id", function(req, res) {
  
  var id = req.params.id;
  //console.log(id);
  db.Note.deleteOne({ "_id": id }, 
    function(err, deleted) {
    // Log any errors if the server encounters one
    if (err) throw err;
       // Otherwise, send the result of this query to the browser
      res.send(deleted);
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});


  