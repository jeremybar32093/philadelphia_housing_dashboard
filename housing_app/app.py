#################################################
# Flask Setup
#################################################
import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from flask_sqlalchemy import SQLAlchemy

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
# Set up database engine - NOTE: will need to update connection string once postgreSQL in the cloud is running
engine = create_engine("postgresql://postgres:postgres@localhost:5432/housing_db")

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(engine, reflect=True)

# Create class for home sales table
PhillyHome = Base.classes.philadelphia_home_sales

#################################################
# Flask routes
#################################################

# Home route - render index.html page
@app.route("/")
def home():
    return render_template("index.html")

# api route to be able to render full dataset using d3.json
@app.route("/api/v1.0/data")
def data():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    # Query based on the PhillyHome table class defined above
    results = session.query(PhillyHome).all()

    # Close session
    session.close()

    # print(results[0])
    houses = []
    for result in results:
        houses_dict = {}
        houses_dict["id"] = result.id
        houses_dict["basements"] = result.basements
        houses_dict["building_code_description"] = result.building_code_description
        houses_dict["census_tract"] = result.census_tract
        houses_dict["central_air"] = result.central_air
        houses_dict["depth"] = result.depth
        houses_dict["exempt_building"] = result.exempt_building
        houses_dict["exempt_land"] = result.exempt_land
        houses_dict["exterior_condition"] = result.exterior_condition
        houses_dict["fireplaces"] = result.fireplaces
        houses_dict["frontage"] = result.frontage
        houses_dict["fuel"] = result.fuel
        houses_dict["garage_spaces"] = result.garage_spaces
        houses_dict["garage_type"] = result.garage_type
        houses_dict["geographic_ward"] = result.geographic_ward
        houses_dict["interior_condition"] = result.interior_condition
        houses_dict["location"] = result.location
        houses_dict["market_value"] = result.market_value
        houses_dict["market_value_date"] = result.market_value_date
        houses_dict["number_of_bathrooms"] = result.number_of_bathrooms
        houses_dict["number_of_bedrooms"] = result.number_of_bedrooms
        houses_dict["number_of_rooms"] = result.number_of_rooms
        houses_dict["number_stories"] = result.number_stories
        houses_dict["quality_grade"] = result.quality_grade
        houses_dict["sale_date"] = result.sale_date
        houses_dict["sale_price"] = result.sale_price
        houses_dict["street_designation"] = result.street_designation
        houses_dict["street_direction"] = result.street_direction
        houses_dict["street_name"] = result.street_name
        houses_dict["taxable_building"] = result.taxable_building
        houses_dict["taxable_land"] = result.taxable_land
        houses_dict["topography"] = result.topography
        houses_dict["total_area"] = result.total_area
        houses_dict["total_liveable_area"] = result.total_liveable_area
        houses_dict["type_heater"] = result.type_heater
        houses_dict["unit"] = result.unit
        houses_dict["view_type"] = result.view_type
        houses_dict["year_built"] = result.year_built
        houses_dict["year_built_estimate"] = result.year_built_estimate
        houses_dict["zip_code"] = result.zip_code

        houses.append(houses_dict)

    
    return jsonify(houses)



## TO DO: 
# Add API route
# Add homepage(index.html) route


#################################################
# Run flask app
#################################################
if __name__ == '__main__':
    app.run(debug=True)

