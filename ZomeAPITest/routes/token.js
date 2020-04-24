'use strict';
var express = require('express');
var router = express.Router();
var request = require('request'); //HTTPリクエストモジュール
const cm = require("../common/connection_manager.js");

/* GET token page. */
router.get('/', function (req, res) {

    // クエリパラメータcodeを取得
    const authCode = req.query.code;
    console.log('code:' + authCode);

    // HTTPリクエストオプション設定
    const options = {
        url: 'https://api.zoom.us/oauth/token',
        method: 'POST',
        qs: {
            grant_type: 'authorization_code',
            code: authCode,
            //redirect_uri: 'http://localhost:1337/token'
            redirect_uri: 'https://tmori-eval-test.apigee.net/zoomapi/token'
        },
        headers: {
            //'Authorization': 'Basic OHpjaVh3TElTV2RYWUR2VEx3WDZ3OnNCeWJkSDMyRlhCdVJQMk9UOTRhYzdpREtCWUlaMUU4'
            'Authorization': 'Basic dk94ZHM3NnlSRkc3cGVKdDNyeGZ3Zzo5WktzU1o4MjA3TVFldVdmbFNBNmowd3VaYnVCd08wUw=='
        }
    }
    // HTTPリクエスト実行
    request(options, function (error, response, body) {
        console.log('error:' + error);
        console.log('body:' + body);
        // JSONパース
        const json = JSON.parse(body);
        console.log('AccessToken:' + json.access_token);
        console.log('RefreshToken:' + json.refresh_token);

        // アクセストークンをマネージャークラスに設定
        cm.setAccessToken(json.access_token);
        cm.setRefreshToken(json.refresh_token);

        // 画面表示
        res.render('token', {
            access_token: json.access_token,
            refresh_token: json.refresh_token,
            res_body: body
        });

    })

});

module.exports = router;