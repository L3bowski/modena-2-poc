const getExpressApp = require('./get-express-app');

const app = getExpressApp();
app.listen(3002, error => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('App 2 running in port 3002');
    }
});