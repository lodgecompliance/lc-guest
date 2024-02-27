const countries = require('../countries.json');

const helper = {
    countries,
    getCountryByKey: (key, value) => {
        return countries.find(country => country[key] == value);
    }
};

export default helper;