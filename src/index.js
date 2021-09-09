const Koa = require('koa');
const Router = require('@koa/router');
const {generateApplication} = require("./libs/application");
const {generateTempCode, generateAccessToken} = require("./libs/oauth2");
const app = new Koa();
const router = new Router();

const applicationList = [];
const accessTokenRepository = []
const tempCodeRepository = [];

router.get('/application/apply', function (ctx) {
  let application = generateApplication();
  applicationList.push(application)
  console.log('application list length', applicationList.length)
  ctx.body = application;
});


router.get('/token', ctx => {
  let {redirect_uri = "", appid = ""} = ctx.query
  if (!redirect_uri) {
    ctx.body = {
      "code": -10000,
      "msg": "redirect_uri参数无效"
    }
    return;
  }
  if (!appid) {
    ctx.body = {
      "code": -10001,
      "msg": "appid不存在"
    }
    return;
  }
  if (!applicationList.find(app => String(app.appid) === String(appid))) {
    ctx.body = {
      "code": -10002,
      "msg": "appid无效"
    }
    return;
  }
  ctx.redirect('/token/grant?redirect_back_uri=' + encodeURIComponent(redirect_uri));
});

router.get('/token/grant', ctx => {
  ctx.body = `
    <html lang="zh">
        <head>
            <title>授权认证</title>
        </head>
        <body>
            <form action="" method="post">
                <label for="">
                    <input type="text" name="username" />
                </label>
                <label for="">
                    <input type="password" name="password" />                
</label>
                <button type="submit" >授权</button>
            </form>
        </body>
    </html>
  `
});


router.get("/access-token", ctx => {
  const {code, appid, secret} = ctx.query;

  let codeIdx;
  if ((codeIdx = tempCodeRepository.indexOf(code)) === -1) {
    ctx.body = {
      code: -10003,
      msg: "code无效"
    };
    return
  }

  tempCodeRepository.splice(codeIdx, 1);

  const appValid = applicationList.find(app => String(app.appid) === String(appid) && app.secret === secret);

  if (!appValid) {
    ctx.body = {
      code: -10004,
      msg: "appid 或 secret 无效"
    };
  }

  let tokenObj = generateAccessToken();
  accessTokenRepository.push(tokenObj)
  ctx.body = tokenObj
});


router.get('/resource/user/:id', function (ctx) {
  const {access_token = ""} = ctx.query;
  if (!access_token || !accessTokenRepository.find(tokenObj => tokenObj.accessToken === access_token)) {
    ctx.body = {
      code: -200001,
      msg: "access token无效"
    }
    return
  }
  ctx.body = {
    user: {
      id: ctx.params.id,
      date: new Date().toLocaleDateString()
    }
  }
});

router.post('/token/grant', ctx => {
  let {redirect_back_uri = ""} = ctx.query;
  if (!redirect_back_uri) {
    ctx.body = "error";
    return
  }
  // check username and password
  const code = generateTempCode();
  tempCodeRepository.push(code)
  const redirect_back_url = decodeURIComponent(redirect_back_uri) + "?code="+code;
  ctx.redirect(redirect_back_url)
});

/////////////////////////////////////////////////////////////
// client server
const clientRoute = new Router({prefix: "/client"});
clientRoute.get('/auth-callback', function (ctx) {
  const {code} = ctx.query;
  ctx.body = "auth grant ok"
});

app
  .use(router.routes())
  .use(clientRoute.routes())
  .use(router.allowedMethods());

app.listen(3000, function (err) {
  if (!err) {
    console.log("application started at: http://127.0.0.1:3000")
  }
});
