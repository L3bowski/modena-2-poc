const getExpressApp = require('./get-express-app');

const app = getExpressApp();
app.listen(3000, error => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Promise app running in port 3000');
    }
});