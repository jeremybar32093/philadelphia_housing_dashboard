# Philadelphia Housing Dashboard

## Heroku Application Link
- https://philadelphia-housing-dashboard.herokuapp.com/

## Team Members
- Anjanette Velazco
- Anthony Carannante
- DeAngelo Williams
- Dominique DeMoe
- Jeremy Bar

## Description
This repository contains a python Flask application that houses a website to perform a high level analysis and exploration of the Philadelphia housing market over the past 5 years (2016-2020). 

Within the housing_app directory, there are the files necessary for the application and webpage design:
- app.py -> Python Flask application
- templates directory -> HTML webpage templates
- static directory -> contains Javascript and CSS files for each webpage
- source_data directory -> cleaned source data used
- db -> SQL database schema

Within the Layout directory, there are the base files for the overall webpage layout.

The following files were required for deploying the flask application to Heroku:
- requirements.txt
- run.sh
- Procfile

## Dashboard

The dashboard allows the user to get an overall idea of the housing market in recent years. It displays the number of homes sold, the amount of money exchanged for home sales, and summary statistics of the year such as mean, median, etc. For home sold in the respective year, the user can view the age and interior/exterior conditions of all home sales as well as the top 5 areas of Philadelphia with the most activity, sorted by zip code.

<img width="865" alt="Screen Shot 2021-07-25 at 12 55 35 PM" src="https://user-images.githubusercontent.com/79670978/126907071-7bda75b5-a397-4740-a898-92225b603a2e.png">

## Interactive Heat Map

The heat map allows the user to zero-in on an area to see specifically where homes were sold within a specific zip code.

<img width="1088" alt="Screen Shot 2021-07-25 at 12 56 26 PM" src="https://user-images.githubusercontent.com/79670978/126907100-ad31d475-131a-4dcd-b2a4-1f2ffb14659e.png">

## Interactive Scatter Plot

The scatter plot allows the user to filter home sales based on zip code and other amenities to see how a certain area or amenity may affect home sale prices.

<img width="1110" alt="Screen Shot 2021-07-25 at 12 57 06 PM" src="https://user-images.githubusercontent.com/79670978/126907113-ee11185f-9153-4ce0-b724-988cd7bfb686.png">

## Interactive Line Chart

The line chart shows month-by-month how many homes were sold within a specific year to give users an idea on the best time to put an offer on a house.

<img width="1004" alt="Screen Shot 2021-07-25 at 12 57 45 PM" src="https://user-images.githubusercontent.com/79670978/126907126-db13321a-c63a-4de1-872b-95d7bb4a455d.png">

## Comps Analysis

The comps analysis gives users the top 5 home sales within a specific area, filterable by zip code and other amenities. It will display attributes of the house so a user can get an idea of what a home would sell for in that area. This is the last piece of the user experience once they have decided where they are interested in buying a home in the city. This will give them an idea of what they might pay for such a home.

<img width="362" alt="Screen Shot 2021-07-25 at 12 58 23 PM" src="https://user-images.githubusercontent.com/79670978/126907147-8ffcfa33-e2bc-4cb7-9960-dea5180437d5.png">

## Future Enhancements

In the future, we will look into designing a predictive model via machine learning to determine future housing prices. 
