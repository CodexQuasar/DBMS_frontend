// data.js — Local schema definitions and example queries

export const SCHEMAS = {
    concert_singer: {
        tables: ['singer', 'concert', 'singer_in_concert', 'stadium'],
        columns: {
            singer: ['Singer_ID', 'Name', 'Country', 'Song_Name', 'Song_release_year', 'Age', 'Is_male'],
            concert: ['concert_ID', 'concert_Name', 'Theme', 'Stadium_ID', 'Year'],
            singer_in_concert: ['concert_ID', 'Singer_ID'],
            stadium: ['Stadium_ID', 'Location', 'Name', 'Capacity', 'Highest', 'Lowest', 'Average'],
        },
        fks: [
            ['concert.Stadium_ID', 'stadium.Stadium_ID'],
            ['singer_in_concert.concert_ID', 'concert.concert_ID'],
            ['singer_in_concert.Singer_ID', 'singer.Singer_ID'],
        ],
    },
    world_1: {
        tables: ['City', 'Country', 'CountryLanguage'],
        columns: {
            City: ['ID', 'Name', 'CountryCode', 'District', 'Population'],
            Country: ['Code', 'Name', 'Continent', 'Region', 'SurfaceArea', 'IndepYear', 'Population', 'LifeExpectancy', 'GNP', 'LocalName', 'GovernmentForm', 'HeadOfState', 'Capital'],
            CountryLanguage: ['CountryCode', 'Language', 'IsOfficial', 'Percentage'],
        },
        fks: [
            ['City.CountryCode', 'Country.Code'],
            ['CountryLanguage.CountryCode', 'Country.Code'],
        ],
    },
    car_1: {
        tables: ['continents', 'countries', 'car_makers', 'model_list', 'car_names', 'cars_data'],
        columns: {
            continents: ['ContId', 'Continent'],
            countries: ['CountryId', 'CountryName', 'Continent'],
            car_makers: ['Id', 'Maker', 'FullName', 'Country'],
            model_list: ['ModelId', 'Maker', 'Model'],
            car_names: ['MakeId', 'Model', 'Make'],
            cars_data: ['Id', 'MPG', 'Cylinders', 'Edispl', 'Horsepower', 'Weight', 'Accelerate', 'Year'],
        },
        fks: [
            ['countries.Continent', 'continents.ContId'],
            ['car_makers.Country', 'countries.CountryId'],
            ['model_list.Maker', 'car_makers.Id'],
            ['car_names.Model', 'model_list.Model'],
            ['cars_data.Id', 'car_names.MakeId'],
        ],
    },
    employee_hire: {
        tables: ['employee', 'shop', 'hiring', 'evaluation'],
        columns: {
            employee: ['Employee_ID', 'Name', 'Age', 'City'],
            shop: ['Shop_ID', 'Name', 'Location', 'District', 'Number_products', 'Manager_name'],
            hiring: ['Shop_ID', 'Employee_ID', 'Start_from', 'Is_full_time'],
            evaluation: ['Employee_ID', 'Year_awarded', 'Bonus'],
        },
        fks: [
            ['hiring.Shop_ID', 'shop.Shop_ID'],
            ['hiring.Employee_ID', 'employee.Employee_ID'],
            ['evaluation.Employee_ID', 'employee.Employee_ID'],
        ],
    },
    student_transcripts: {
        tables: ['Students', 'Courses', 'Sections', 'Transcripts', 'Departments', 'Addresses'],
        columns: {
            Students: ['student_id', 'current_address_id', 'first_name', 'last_name', 'email_address', 'date_first_registered'],
            Courses: ['course_id', 'course_name', 'course_description'],
            Sections: ['section_id', 'course_id', 'section_name'],
            Transcripts: ['transcript_id', 'transcript_date'],
            Departments: ['department_id', 'department_name'],
            Addresses: ['address_id', 'line_1', 'city', 'zip_postcode', 'state_province_county', 'country'],
        },
        fks: [
            ['Students.current_address_id', 'Addresses.address_id'],
            ['Sections.course_id', 'Courses.course_id'],
        ],
    },
};

export const EXAMPLES = [
    {
        db: 'concert_singer',
        query: 'Show the name and country of origin of each singer, ordered by age.',
        ratsql: 'SELECT T1.Name, T1.Country\nFROM singer AS T1\nORDER BY T1.Age ASC',
        ai: 'SELECT Name, Country\nFROM singer\nORDER BY Age',
        match: 'exact',
        beam: '0.923',
        links: 6,
        steps: [
            { tok: 'SELECT', type: 'kw', action: 'Action: ApplyRule(Start)', conf: 0.99 },
            { tok: 'T1.Name', type: 'col', action: 'Action: SelectColumn(singer.Name)', conf: 0.94 },
            { tok: ',', type: 'op', action: 'Action: ApplyRule(Comma)', conf: 0.99 },
            { tok: 'T1.Country', type: 'col', action: 'Action: SelectColumn(singer.Country)', conf: 0.91 },
            { tok: 'FROM', type: 'kw', action: 'Action: ApplyRule(From)', conf: 0.99 },
            { tok: 'singer AS T1', type: 'tbl', action: 'Action: SelectTable(singer)', conf: 0.97 },
            { tok: 'ORDER BY', type: 'kw', action: 'Action: ApplyRule(OrderBy)', conf: 0.88 },
            { tok: 'T1.Age', type: 'col', action: 'Action: SelectColumn(singer.Age)', conf: 0.93 },
            { tok: 'ASC', type: 'kw', action: 'Action: ApplyRule(Asc)', conf: 0.82 },
        ],
    },
    {
        db: 'world_1',
        query: 'What is the total population of countries in Asia?',
        ratsql: "SELECT SUM(T1.Population)\nFROM Country AS T1\nWHERE T1.Continent = 'Asia'",
        ai: "SELECT SUM(Population)\nFROM Country\nWHERE Continent = 'Asia'",
        match: 'exact',
        beam: '0.957',
        links: 4,
        steps: [
            { tok: 'SELECT', type: 'kw', action: 'Action: ApplyRule(Start)', conf: 0.99 },
            { tok: 'SUM', type: 'fn', action: 'Action: ApplyRule(Agg=sum)', conf: 0.91 },
            { tok: 'T1.Population', type: 'col', action: 'Action: SelectColumn(Country.Population)', conf: 0.96 },
            { tok: 'FROM', type: 'kw', action: 'Action: ApplyRule(From)', conf: 0.99 },
            { tok: 'Country AS T1', type: 'tbl', action: 'Action: SelectTable(Country)', conf: 0.98 },
            { tok: 'WHERE', type: 'kw', action: 'Action: ApplyRule(Where)', conf: 0.95 },
            { tok: "T1.Continent", type: 'col', action: 'Action: SelectColumn(Country.Continent)', conf: 0.89 },
            { tok: '=', type: 'op', action: "Action: ApplyRule(Op==)", conf: 0.97 },
            { tok: "'Asia'", type: 'val', action: "Action: ValueLink('Asia'→literal)", conf: 0.88 },
        ],
    },
    {
        db: 'car_1',
        query: 'How many car models were made by each maker? Show maker name and count.',
        ratsql: 'SELECT T2.FullName, COUNT(T1.ModelId)\nFROM model_list AS T1\nJOIN car_makers AS T2 ON T1.Maker = T2.Id\nGROUP BY T2.FullName',
        ai: 'SELECT FullName, COUNT(*) AS model_count\nFROM car_makers\nJOIN model_list ON car_makers.Id = model_list.Maker\nGROUP BY FullName',
        match: 'equivalent',
        beam: '0.871',
        links: 8,
        steps: [
            { tok: 'SELECT', type: 'kw', action: 'Action: ApplyRule(Start)', conf: 0.99 },
            { tok: 'T2.FullName', type: 'col', action: 'Action: SelectColumn(car_makers.FullName)', conf: 0.87 },
            { tok: ',', type: 'op', action: 'Action: ApplyRule(Comma)', conf: 0.99 },
            { tok: 'COUNT', type: 'fn', action: 'Action: ApplyRule(Agg=count)', conf: 0.93 },
            { tok: 'T1.ModelId', type: 'col', action: 'Action: SelectColumn(model_list.ModelId)', conf: 0.85 },
            { tok: 'FROM', type: 'kw', action: 'Action: ApplyRule(From)', conf: 0.99 },
            { tok: 'model_list AS T1', type: 'tbl', action: 'Action: SelectTable(model_list)', conf: 0.91 },
            { tok: 'JOIN', type: 'kw', action: 'Action: ApplyRule(Join)', conf: 0.94 },
            { tok: 'car_makers AS T2', type: 'tbl', action: 'Action: SelectTable(car_makers)', conf: 0.89 },
            { tok: 'ON T1.Maker=T2.Id', type: 'op', action: 'Action: FKLink(model_list.Maker→car_makers.Id)', conf: 0.97 },
            { tok: 'GROUP BY', type: 'kw', action: 'Action: ApplyRule(GroupBy)', conf: 0.92 },
            { tok: 'T2.FullName', type: 'col', action: 'Action: SelectColumn(car_makers.FullName)', conf: 0.90 },
        ],
    },
];
