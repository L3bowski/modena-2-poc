const getExpressApp = require('./get-express-app');

const app = getExpressApp();
app.listen(3006, error => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Public domain app running in port 3006');
    }
});