// frameworks to use
var request = require('request');
var cheerio = require('cheerio');
var json2xls = require('json2xls');
var fs = require('fs');

// request to get html
request('https://www.fanfiction.net/u/6510999/snpro2000', function (error, response, html) {
    if (!error && response.statusCode == 200) {

        // $ will now refer to the html DOM
        var $ = cheerio.load(html, {
            decodeEntities: true,
            normalizeWhitespace: true
        });

        // array to hold the story objects (which will be turned into a JSON format later)
        var stories = [];
        var numStories = 0;

        // getting the data attributes and the author
        $('div[class="z-list favstories"]').each(function(i, element){
            var story = {};

            story.Category = $(element).attr('data-category').replace(/\\'/g,"'");

            story.StoryLink = 'https://www.fanfiction.net/s/' + $(element).attr('data-storyid');
            story.Title = $(element).attr('data-title').replace(/\\'/g,"'");
            story.Words = $(element).attr('data-wordcount');
            story.Reviews = $(element).attr('data-ratingtimes');
            story.Chapters = $(element).attr('data-chapters');

            // 2 = completed
            // 1 = work in progress
            story.Status = $(element).attr('data-statusid');
            if (story.Status == 2)
                story.Status = "Complete";
            else
                story.Status = "In Progress";

            story.Author = $(element).find('div > a').last().prev().text().trim();

            stories.push(story);
            numStories++;
        });

        // getting the summary, publish date, update date, characters, etc.

        var k = 0;
        $('div[class="z-indent z-padtop"]').each(function(i, element){

            // stop when we reach the end of the favorite story list
            // do not want to continue going to the self written stories
            if (k >= numStories)
                return false;

            //stories[i].summary = $(element).first().contents().filter(function(){ return this.type === 'text';}).text();
            stories[i]['Published Date'] = $(element).find('div > span').last().text();
            stories[i]['Update Date'] = $(element).find('div > span').first().text();

            // get characters
            var meta = $(element).find('div > div ').text();
            meta = meta.substring(meta.indexOf(stories[i].Category) + stories[i].Category.length + 3);

            var datePublished = "Published: " + stories[i]['Published Date'] + " - ";
            var index = meta.indexOf(datePublished);
            if (stories[i].Status == 1){
                stories[i].Characters = meta.substring(index + datePublished.length, meta.length);
            }
            else{
                stories[i].Characters = meta.substring(index + datePublished.length, meta.length - (" - Complete").length);
            }

            var dateUpdated;

            // get Favs and Follows
            if (stories[i]['Update Date'] == stories[i]['Published Date'])
                dateUpdated = "Published: ";
            else
                dateUpdated = "Updated: ";

            var reviews = "Reviews: " + stories[i].Reviews;
            var favsAndFollows = meta.substring(meta.indexOf(reviews) + reviews.length + 3, meta.indexOf(dateUpdated)-3).split(" - ");
            stories[i].Favorites = favsAndFollows[0].substring(favsAndFollows[0].indexOf("Favs: ") + "Favs: ".length);

            if (favsAndFollows.length == 2)
                stories[i].Follows = favsAndFollows[1].substring(favsAndFollows[1].indexOf("Follows: ") + "Follows: ".length);
            else
                stories[i].Follows = 0;

            // get rating (K, K+, T, M) and language
            var metaArray = meta.split(" - ");

            stories[i].Rating = metaArray[0].substring("Rated: ".length);
            stories[i].Language = metaArray[1];

            if (metaArray[2].includes("Chapters: ")){
                stories[i].Genres = "";
            }
            else
                stories[i].Genres = metaArray[2];

            k++;
        });

        var xls = json2xls(stories);
        fs.writeFileSync('data.xlsx', xls, 'binary');
    }
});