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
from sqlalchemy import desc, asc
from sqlalchemy.sql.expression import select
# from flask_sqlalchemy import SQLAlchemy

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
# Set up database engine - NOTE: will need to update connection string once postgreSQL in the cloud is running
engine = create_engine("postgresql://postgres:postgres@bootcamp.clwg1d6bpji9.us-east-2.rds.amazonaws.com:5432/housing_db", pool_timeout=150)

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(engine, reflect=True)

# Create class for home sales table
PhillyHome = Base.classes.philadelphia_home_sales

# Create class for ref basements table
PhillyHome_basements = Base.classes.ref_basements

# Create class for ref exterior condition table
PhillyHome_ext_condition = Base.classes.ref_exterior_condition

#################################################
# Flask routes
#################################################

# Home route - render index.html page
@app.route("/")
def home():
    # Create session to query DB to return possible dropdown values
    session = Session(engine)

    # Return unique list for each year directly from SQL Database
    year = session.execute("""SELECT DISTINCT
    CAST(EXTRACT(YEAR from sale_date) AS VARCHAR(4))
    from philadelphia_home_sales
    ORDER BY CAST(EXTRACT(YEAR from sale_date) AS VARCHAR(4)) DESC;""")

    # Close session
    session.close()

    # Render index.html template, pass in context variables for possible filtering values
    return render_template("index.html", year = year)

# Map route - render map.html
@app.route("/map")
def map():
    # Create session to query DB to return possible dropdown values
    session = Session(engine)
    
    # Return unique list for each year directly from SQL Database
    year = session.execute("""SELECT DISTINCT
    CAST(EXTRACT(YEAR from sale_date) AS VARCHAR(4))
    from philadelphia_home_sales
    ORDER BY CAST(EXTRACT(YEAR from sale_date) AS VARCHAR(4)) DESC;""")

    # Filter values from SQL Database
    zip_codes = session.query(PhillyHome.zip_code.distinct()).order_by(asc(PhillyHome.zip_code))
    category_code = session.query(PhillyHome.category_code_description.distinct()).order_by(asc(PhillyHome.category_code_description))
    building_code = session.query(PhillyHome.building_code_description.distinct()).order_by(asc(PhillyHome.building_code_description))
    basements = session.query(PhillyHome_basements.rb_id, PhillyHome_basements.rb_value).all()
    central_air = session.query(PhillyHome.central_air.distinct()).order_by(asc(PhillyHome.central_air))
    # exterior_condition = session.query(PhillyHome.exterior_condition.distinct()).order_by(asc(PhillyHome.exterior_condition))
    exterior_condition = session.query(PhillyHome_ext_condition.rec_id, PhillyHome_ext_condition.rec_value).all()
    garage_spaces = ['Yes','No']
    fireplaces = ['Yes','No']

    # Close session
    session.close()
    
    
    # Render index.html template, pass in context variables for possible filtering values
    return render_template("map.html", year = year, zip_codes = zip_codes, category_code = category_code, building_code = building_code, basements = basements, central_air = central_air, exterior_condition = exterior_condition, garage_spaces = garage_spaces, fireplaces = fireplaces)

# Line route - render line.html
@app.route("/line")
def line():
    # Create session to query DB to return possible dropdown values
    session = Session(engine)
    
    # Return unique list for each year directly from SQL Database
    year = session.execute("""SELECT DISTINCT
    CAST(EXTRACT(YEAR from sale_date) AS VARCHAR(4))
    from philadelphia_home_sales
    ORDER BY CAST(EXTRACT(YEAR from sale_date) AS VARCHAR(4)) DESC;""")

    # Filter values from SQL Database
    zip_codes = session.query(PhillyHome.zip_code.distinct()).order_by(asc(PhillyHome.zip_code))
    category_code = session.query(PhillyHome.category_code_description.distinct()).order_by(asc(PhillyHome.category_code_description))
    building_code = session.query(PhillyHome.building_code_description.distinct()).order_by(asc(PhillyHome.building_code_description))
    basements = session.query(PhillyHome_basements.rb_id, PhillyHome_basements.rb_value).all()
    central_air = session.query(PhillyHome.central_air.distinct()).order_by(asc(PhillyHome.central_air))
    # exterior_condition = session.query(PhillyHome.exterior_condition.distinct()).order_by(asc(PhillyHome.exterior_condition))
    exterior_condition = session.query(PhillyHome_ext_condition.rec_id, PhillyHome_ext_condition.rec_value).all()
    garage_spaces = ['Yes','No']
    fireplaces = ['Yes','No']

    # Close session
    session.close()

    # Render index.html template, pass in context variables for possible filtering values
    return render_template("line.html", year = year, zip_codes = zip_codes, category_code = category_code, building_code = building_code, basements = basements, central_air = central_air, exterior_condition = exterior_condition, garage_spaces = garage_spaces, fireplaces = fireplaces)

# Comps route - render comps.html
@app.route("/comps")
def comps():
    # Create session to query DB to return possible dropdown values
    session = Session(engine)
    
    # Return unique list for each year directly from SQL Database
    year = session.execute("""SELECT DISTINCT
    CAST(EXTRACT(YEAR from sale_date) AS VARCHAR(4))
    from philadelphia_home_sales
    ORDER BY CAST(EXTRACT(YEAR from sale_date) AS VARCHAR(4)) DESC;""")

    # Filter values from SQL Database
    zip_codes = session.query(PhillyHome.zip_code.distinct()).order_by(asc(PhillyHome.zip_code))
    category_code = session.query(PhillyHome.category_code_description.distinct()).order_by(asc(PhillyHome.category_code_description))
    building_code = session.query(PhillyHome.building_code_description.distinct()).order_by(asc(PhillyHome.building_code_description))
    basements = session.query(PhillyHome_basements.rb_id, PhillyHome_basements.rb_value).all()
    central_air = session.query(PhillyHome.central_air.distinct()).order_by(asc(PhillyHome.central_air))
    # exterior_condition = session.query(PhillyHome.exterior_condition.distinct()).order_by(asc(PhillyHome.exterior_condition))
    exterior_condition = session.query(PhillyHome_ext_condition.rec_id, PhillyHome_ext_condition.rec_value).all()
    garage_spaces = ['Yes','No']
    fireplaces = ['Yes','No']

    # Close session
    session.close()

    # Render index.html template, pass in context variables for possible filtering values
    return render_template("comps.html", year = year, zip_codes = zip_codes, category_code = category_code, building_code = building_code, basements = basements, central_air = central_air, exterior_condition = exterior_condition, garage_spaces = garage_spaces, fireplaces = fireplaces)

# Comps route - render scatter.html
@app.route("/scatter")
def scatter():
    # Create session to query DB to return possible dropdown values
    session = Session(engine)
    
    # Return unique list for each year directly from SQL Database
    year = session.execute("""SELECT DISTINCT
    CAST(EXTRACT(YEAR from sale_date) AS VARCHAR(4))
    from philadelphia_home_sales
    ORDER BY CAST(EXTRACT(YEAR from sale_date) AS VARCHAR(4)) DESC;""")

    # Filter values from SQL Database
    zip_codes = session.query(PhillyHome.zip_code.distinct()).order_by(asc(PhillyHome.zip_code))
    category_code = session.query(PhillyHome.category_code_description.distinct()).order_by(asc(PhillyHome.category_code_description))
    building_code = session.query(PhillyHome.building_code_description.distinct()).order_by(asc(PhillyHome.building_code_description))
    basements = session.query(PhillyHome_basements.rb_id, PhillyHome_basements.rb_value).all()
    central_air = session.query(PhillyHome.central_air.distinct()).order_by(asc(PhillyHome.central_air))
    # exterior_condition = session.query(PhillyHome.exterior_condition.distinct()).order_by(asc(PhillyHome.exterior_condition))
    exterior_condition = session.query(PhillyHome_ext_condition.rec_id, PhillyHome_ext_condition.rec_value).all()
    garage_spaces = ['Yes','No']
    fireplaces = ['Yes','No']

    # Close session
    session.close()

    # Render index.html template, pass in context variables for possible filtering values
    return render_template("scatter.html", year = year, zip_codes = zip_codes, category_code = category_code, building_code = building_code, basements = basements, central_air = central_air, exterior_condition = exterior_condition, garage_spaces = garage_spaces, fireplaces = fireplaces)

@app.route("/analyzer")
def analyzer():
    return render_template("analyzer.html")

@app.route("/comps-drill-through/<selected_address>/<selected_zip_code>/<target_square_footage>/<comp_1_square_footage>/<comp_2_square_footage>/<comp_3_square_footage>/<comp_4_square_footage>/<comp_5_square_footage>/<comp_1_sale_price>/<comp_2_sale_price>/<comp_3_sale_price>/<comp_4_sale_price>/<comp_5_sale_price>")
def comps_drill_through(selected_address, selected_zip_code, target_square_footage, comp_1_square_footage, comp_2_square_footage, comp_3_square_footage, comp_4_square_footage, comp_5_square_footage, comp_1_sale_price, comp_2_sale_price, comp_3_sale_price, comp_4_sale_price, comp_5_sale_price):
    return render_template("comps-drill-through.html", selected_address = selected_address, selected_zip_code = selected_zip_code, target_square_footage = target_square_footage,
                            comp_1_square_footage = comp_1_square_footage,
                            comp_2_square_footage = comp_2_square_footage,
                            comp_3_square_footage = comp_3_square_footage,
                            comp_4_square_footage = comp_4_square_footage,
                            comp_5_square_footage = comp_5_square_footage,
                            comp_1_sale_price = comp_1_sale_price,
                            comp_2_sale_price = comp_2_sale_price,
                            comp_3_sale_price = comp_3_sale_price,
                            comp_4_sale_price = comp_4_sale_price,
                            comp_5_sale_price = comp_5_sale_price)

# api route to be able to render full dataset using d3.json
@app.route("/api/v1.0/data")
def data():
    filter_query = request.query_string
    
    # Create our session (link) from Python to the DB
    session = Session(engine)

    if filter_query == '':
        # Query based on the PhillyHome table class defined above
        results = session.query(PhillyHome).all()

    else:
        year_selected = request.args.get('year')
        if year_selected.strip() == 'no_selection':
            year_query = '1=1'
        else:
            year_query = f"CAST(EXTRACT(YEAR from sale_date) AS VARCHAR(4))='{year_selected.strip()}'"

        zip_selected = request.args.get('zip_codes')
        if zip_selected.strip() == 'no_selection':
            zip_query = '1=1'
        else:
            zip_query = f"zip_code = '{zip_selected}'"

        ccode_selected = request.args.get('category_code')
        if ccode_selected.strip() == 'no_selection':
            ccode_query = '1=1'
        else:
            ccode_query = f"category_code_description = '{ccode_selected.strip()}'"

        bcode_selected = request.args.get('building_code')
        if bcode_selected.strip() == 'no_selection':
            bcode_query = '1=1'
        else:
            bcode_query = f"building_code_description = '{bcode_selected.strip()}'"

        basement_selected = request.args.get('basements')
        if basement_selected.strip() == 'no_selection':
            basement_query = '1=1'
        else:
            basement_query = f"basements = '{basement_selected.strip()}'"

        central_air_selected = request.args.get('central_air')
        if central_air_selected.strip() == 'no_selection':
            air_query = '1=1'
        else:
            air_query = f"central_air = '{central_air_selected.strip()}'"

        ext_cond_selected = request.args.get('exterior_condition')
        if ext_cond_selected.strip() == 'no_selection':
            ext_query = '1=1'
        else:
            ext_query = f"exterior_condition = '{ext_cond_selected}'"

        garage_selected = request.args.get('garage_spaces')
        if garage_selected.strip() == 'no_selection':
            garage_query = '1=1'
        else:
            if garage_selected.strip() == 'Y':
                garage_query = f"garage_spaces > 0"
            else:
                garage_query = 'garage_spaces = 0'

        fireplace_selected = request.args.get('fireplaces')
        if fireplace_selected.strip() == 'no_selection':
            fireplace_query = '1=1'
        else:
            if fireplace_selected.strip() == 'Y':
                fireplace_query = f"fireplaces > 0"
            else:
                fireplace_query = f"fireplaces = 0"

        sql_query = f"""SELECT * FROM philadelphia_home_sales 
        WHERE {year_query} 
        AND {zip_query} 
        AND {ccode_query} 
        AND {bcode_query} 
        AND {basement_query} 
        AND {air_query} 
        AND {ext_query} 
        AND {garage_query} 
        AND {fireplace_query}"""
 
        print(sql_query)
        results = session.execute(sql_query)

    # Close session
    session.close()

    # print(results[0])
    houses = []
    for result in results:
        houses_dict = {}
        houses_dict["id"] = result.id
        houses_dict["basements"] = result.basements
        houses_dict["building_code_description"] = result.building_code_description
        houses_dict["category_code_description"] = result.category_code_description
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

# api route to be able to render dataset to be used in comps valuation
@app.route("/api/v1.0/data/comps")
def compValuation():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    # Extract variables from query string
    zip_selected = request.args.get('zip')
    zip_query = f'zip_code = {zip_selected}'

    bedrooms_selected = request.args.get('number_bedrooms')
    bedroom_query = f'number_of_bedrooms = {bedrooms_selected}'

    bathrooms_selected = request.args.get('number_bathrooms')
    bathroom_query = f'number_of_bathrooms = {bathrooms_selected}'

    square_footage_selected = request.args.get('square_footage')
    # For square footage, return back records within 120 sq. feet
    # Assumes standard bedroom is 10x12
    square_footage_lower_bound = int(square_footage_selected) - 120
    square_footage_upper_bound = int(square_footage_selected) + 120
    square_footage_query_1 = f'total_liveable_area >= {square_footage_lower_bound}'
    square_footage_query_2 = f'total_liveable_area <= {square_footage_upper_bound}'

    parking_spaces_selected = request.args.get('parking_spaces')
    parking_spaces_query = f'garage_spaces = {parking_spaces_selected}'

    sql_query = f"""SELECT * FROM philadelphia_home_sales
                    WHERE {zip_query}
                    AND {bedroom_query}
                    AND {bathroom_query}
                    AND {square_footage_query_1}
                    AND {square_footage_query_2}
                    AND {parking_spaces_query}"""

    print(sql_query)
    results = session.execute(sql_query)

    # Close session
    session.close()

    # Parse results from sql query and create JSON response
    houses = []
    for result in results:
        houses_dict = {}
        houses_dict["id"] = result.id
        houses_dict["basements"] = result.basements
        houses_dict["building_code_description"] = result.building_code_description
        houses_dict["category_code_description"] = result.category_code_description
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



#################################################
# Run flask app
#################################################
if __name__ == '__main__':
    app.run(debug=True)

