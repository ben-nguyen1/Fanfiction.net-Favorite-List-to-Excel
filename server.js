// frameworks to use
var request = require('request');
var cheerio = require('cheerio');

// request to get html
request('https://www.fanfiction.net/u/2317158', function (error, response, html) {
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

            story.category = $(element).attr('data-category').replace(/\\'/g,"'");

            // use the story id to create the link later
            // www.fanfiction.net/s/{{story.storyId}}
            story.storyId = $(element).attr('data-storyid');

            story.title = $(element).attr('data-title').replace(/\\'/g,"'");
            story.wordCount = $(element).attr('data-wordcount');
            story.numReviews = $(element).attr('data-ratingtimes');
            story.numChapters = $(element).attr('data-chapters');

            // 2 = completed
            // 1 = work in progress
            story.statusId = $(element).attr('data-statusid');

            story.author = $(element).find('div > a').last().prev().text().trim();

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

            stories[i].summary = $(element).first().contents().filter(function(){ return this.type === 'text';}).text();
            stories[i].datePublished = $(element).find('div > span').last().text();
            stories[i].dateUpdated = $(element).find('div > span').first().text();

            // get characters
            var meta = $(element).find('div > div ').text();
            meta = meta.substring(meta.indexOf(stories[i].category) + stories[i].category.length + 3);

            var datePublished = "Published: " + stories[i].datePublished + " - ";
            var index = meta.indexOf(datePublished);
            if (stories[i].statusId == 1){
                stories[i].characters = meta.substring(index + datePublished.length, meta.length);
            }
            else{
                stories[i].characters = meta.substring(index + datePublished.length, meta.length - (" - Complete").length);
            }

            // get numFavs and numFollows
            if (stories[i].dateUpdated == stories[i].datePublished)
                dateUpdated = "Published: ";
            else
                var dateUpdated = "Updated: ";

            var reviews = "Reviews: " + stories[i].numReviews;
            var favsAndFollows = meta.substring(meta.indexOf(reviews) + reviews.length + 3, meta.indexOf(dateUpdated)-3).split(" - ");
            stories[i].numFavorites = favsAndFollows[0].substring(favsAndFollows[0].indexOf("Favs: ") + "Favs: ".length);
            stories[i].numFollows = favsAndFollows[1].substring(favsAndFollows[1].indexOf("Follows: ") + "Follows: ".length);

            // get rating (K, K+, T, M) and language
            var metaArray = meta.split(" - ");

            stories[i].rating = metaArray[0].substring("Rated: ".length);
            stories[i].language = metaArray[1];

            if (metaArray[2].includes("Chapters: ")){
                stories[i].genres = "";
            }
            else
                stories[i].genres = metaArray[2];

            k++;
        });

        // print to the console a JSON object of the stories
        // use https://jsonformatter.curiousconcept.com/ to see better results
        console.log(JSON.stringify(stories));
    }
});