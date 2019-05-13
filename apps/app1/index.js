const getExpressApp = require('./get-express-app');

const app = getExpressApp();
app.listen(3001, error => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('App 1 running in port 3001');
    }
});