-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.

-- Modify this code to update the DB schema diagram.
-- To reset the sample schema, replace everything with
-- two dots ('..' - without quotes).

CREATE TABLE "philadelphia_home_sales" (
    "id" int   NOT NULL,
    "basements" VARCHAR(255)   NULL,
    "building_code_description" VARCHAR(255)   NULL,
    "category_code_description" VARCHAR(255)   NULL,
    "census_tract" int   NOT NULL,
    "central_air" VARCHAR(255)   NULL,
    "depth" float   NOT NULL,
    "exempt_building" int   NOT NULL,
	"exempt_land" int   NOT NULL,	 
    "exterior_condition" int   NOT NULL,
    "fireplaces" int   NOT NULL,
    "frontage" float   NOT NULL,
    "fuel" VARCHAR(255)   NULL,
    "garage_spaces" int   NOT NULL,
    "garage_type" VARCHAR(255)   NULL,
    "geographic_ward" int   NOT NULL,
    "interior_condition" int   NULL,
    "location" VARCHAR(255)   NULL,
    "market_value" int   NOT NULL,
    "market_value_date" date   NULL,
    "number_of_bathrooms" int   NOT NULL,
    "number_of_bedrooms" int   NOT NULL,
    "number_of_rooms" int   NOT NULL,
    "number_stories" int   NOT NULL,
    "quality_grade" int   NULL,
    "sale_date" date   NOT NULL,
    "sale_price" int   NOT NULL,
    "street_designation" VARCHAR(255)   NOT NULL,
    "street_direction" VARCHAR(255)   NULL,
    "street_name" VARCHAR(255)   NOT NULL,
    "taxable_building" int   NOT NULL,
    "taxable_land" int   NOT NULL,
    "topography" VARCHAR(255)   NULL,
    "total_area" float   NOT NULL,
    "total_liveable_area" int   NOT NULL,
    "type_heater" VARCHAR(255)   NULL,
    "unit" VARCHAR(255)   NULL,
    "view_type" VARCHAR(255)   NULL,
    "year_built" int   NOT NULL,
    "year_built_estimate" VARCHAR(255)   NULL,
    "zip_code" int   NOT NULL,
    "zoning" VARCHAR(255)   NOT NULL,
    CONSTRAINT "pk_philadelphia_home_sales" PRIMARY KEY (
        "id"
     )
);

CREATE TABLE "ref_basements" (
    "rb_id" VARCHAR(10)   NOT NULL,
    "rb_value" VARCHAR(255)   NULL,
	"rb_value_desc" VARCHAR(255) NULL,

    CONSTRAINT "pk_ref_basements" PRIMARY KEY (
        "rb_id"
     )
);

CREATE TABLE "ref_exterior_condition" (
    "rec_id" VARCHAR(10)   NOT NULL,
    "rec_value" VARCHAR(255)   NULL,
	"rec_value_desc" VARCHAR(500) NULL,

    CONSTRAINT "pk_ref_exterior_condition" PRIMARY KEY (
        "rec_id"
     )
);
