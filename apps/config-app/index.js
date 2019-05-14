const getExpressApp = require('./get-express-app');
const dotenv = require('dotenv');

const importResult = dotenv.config();
if (importResult.error) {
    console.log('Error importing environment configuration')
}

// Getting the values from process.env instead of importResult.parsed so that they can easily be injected in Docker
const environmentConfig = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS
};

const app = getExpressApp(environmentConfig);
app.listen(3004, error => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('ConfigApp running in port 3004');
    }
});