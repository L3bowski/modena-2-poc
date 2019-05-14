const getExpressApp = require('./get-express-app');

const app = getExpressApp();
app.listen(3003, error => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Passport app running in port 3003');
    }
});