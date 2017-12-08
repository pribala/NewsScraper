# NewsScraper
A web app that lets users view and leave comments on the latest news
### Overview

A web app that lets users view and leave comments on the latest news implemented using Mongoose and Cheerio to scrape news from another site.

### Functionality

   - The app that accomplishes the following:

Whenever a user visits site, and clicks on the Scrape Data Button, the app scrape stories from WSJ news outlet and displays them for the user. The user can choose which article to save to the database. The app scrapes and displays the following information for each article:

   - Headline - the title of the article

   - Summary - a short summary of the article

   - URL - the url to the original article


Users can leave comments on the articles displayed and revisit them later. 
The comments are saved to the database as well and associated with their articles. 
Users can also delete comments left on articles. 
All stored comments are visible to every user.