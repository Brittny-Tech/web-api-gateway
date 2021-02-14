const Koa = require('koa');
const Redis = require('ioredis');
const Router = require('koa-router');
const auth = require('koa-basic-auth');
const ratelimit = require('koa-ratelimit');
const bodyParser = require('koa-bodyparser');
const axios = require('axios');
const mount = require('koa-mount');
const cors = require('@koa/cors');

require('dotenv').config();

const middleware = require('./middleware')
const helpers = require('./helpers')

const app = new Koa();
const router = new Router();


// MIDDLEWARE

app.use(cors());

//apply authentication
// custom 401 handling
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.set('WWW-Authenticate', 'Basic');
            ctx.body = 'cant touch this';
        } else {
            throw err;
        }
    }
});

// require auth for some paths
const credentials = {
    name: process.env.USERNAME,
    pass: process.env.PASSWORD
}
app.use(mount('/experience', auth(credentials)));
app.use(mount('/contact', auth(credentials)));

// apply rate limit
app.use(ratelimit({
    driver: 'redis',
    db: new Redis(process.env.REDIS_URL),
    duration: 60000,
    errorMessage: 'Sometimes You Just Have to Slow Down.',
    id: (ctx) => ctx.ip,
    headers: {
        remaining: 'Rate-Limit-Remaining',
        reset: 'Rate-Limit-Reset',
        total: 'Rate-Limit-Total'
    },
    max: 100,
    disableHeader: false,
    whitelist: (ctx) => {
        // some logic that returns a boolean
    },
    blacklist: (ctx) => {
        // some logic that returns a boolean
    }
}));

app.use(bodyParser());


// ROUTES

router
    /* Display a friendly message at the index route  */
    .get('/', (ctx, next) => {
        ctx.body = 'Welcome to my API Gateway!';
    })

    /* This route calls the articles microservice and returns 
    the list of articles, used for the experience section of 
    the web app */
    .get('/experience', async (ctx, next) => {
        let res = await axios.get(process.env.EXPERIENCE_API_URL)
        ctx.body = res.data;
    })

    /* This route calls the email microservice and returns 
    the mailgun response. It is used for the contact section 
    of the web app */
    .post('/contact', middleware.checkBodyParamsDefined(["subject", "html", "from"]), async (ctx, next) => {

        let subject = ctx.request.body.subject;
        let html = ctx.request.body.html;
        let from = ctx.request.body.from;

        let bodyFormData = helpers.generateContactForm(subject, html, from);

        let res = await axios.post(process.env.CONTACT_SERVICE_URL,
            bodyFormData,
            {
                headers: bodyFormData.getHeaders()
            });

        let data = res.data;

        if (helpers.checkResponse(data, "message", "Queued. Thank you.", ctx)) {
            ctx.body = {
                success: true,
                data
            };
        }

    });

app
    .use(router.routes())
    .use(router.allowedMethods());


// RUN SERVER

const PORT = process.env.PORT || 3000;
app.listen(
    PORT,
    () => console.log(`istening on port ${PORT}`)
);