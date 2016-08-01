# MFFF
nodeJS script to get a fanfiction.net user's list of favorite stories in excel

--------------------------------------------------------------------------------------------------

Made this because it was hard to keep track of my favorite stories in fanfiction.net. 
The table at fanfiction.net doesn't have that much options to sort/filter and doesn't display all the information I wanted. 
This nodeJS script will scrape a user's list of favorite stories and extract all the data and info on the stories and put them into an array that holds each story as a JSON object.
It will then convert the array of stories to a very basic excel sheet using json2xls (https://github.com/rikkertkoppes/json2xls). 
In the excel sheet, the hyperlinks are not actually links so you have to follow the first answer on this SO http://stackoverflow.com/questions/2595692/how-do-i-convert-a-column-of-text-urls-into-active-hyperlinks-in-excel

This is my first time writing in nodeJS so the code is very ininefficient.

