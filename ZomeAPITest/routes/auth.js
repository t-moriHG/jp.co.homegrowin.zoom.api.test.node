'use strict';
var express = require('express');
var router = express.Router();

/* 認証コード取得 */
router.get('/', function (req, res) {
    res.writeHead(302, {
        //'Location': 'https://zoom.us/oauth/authorize?response_type=code&client_id=8zciXwLISWdXYDvTLwX6w&redirect_uri=http%3A%2F%2Flocalhost%3A1337%2Ftoken'
        'Location': 'https://zoom.us/oauth/authorize?response_type=code&client_id=vOxds76yRFG7peJt3rxfwg&redirect_uri=https%3A%2F%2Ftmori-eval-test.apigee.net%2Fzoomapi%2Ftoken'
    });
    res.end();
});

module.exports = router;