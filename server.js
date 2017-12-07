var cheerio = require("cheerio");
var request = require("request");

// Make a request call to grab the HTML body from the site of your choice
request("https://minimalistbaker.com/", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var results = [];

  // Select each element in the HTML body from which you want information.
  // NOTE: Cheerio selectors function similarly to jQuery's selectors,
  // but be sure to visit the package's npm page to see how it works
  $("article").each(function(i, element) {

    
    var title = $(element).find('.entry-header').find('.entry-title').text();
    var link = $(element).find('.entry-header').find('.entry-title').find('a').attr("href");
    var img = $(element).find('.entry-content').find('a').find('img').attr("src");
    var summary = $(element).find('.entry-content').find('p').text();
    if(title.length !=0){
    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      link: link,
      img: img,
      summary: summary
    });
  }
  });

  // Log the results once you've looped through each of the elements found with cheerio
  console.log(results);
});
