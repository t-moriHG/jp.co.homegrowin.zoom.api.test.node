'use strict';
var express = require('express');
var router = express.Router();
var request = require('request'); //HTTPリクエストモジュール
const cm = require("../common/connection_manager.js");
var { Client } = require('pg'); // DBクライアント

/* GET meetings/list page. */
router.get('/list', function (req, res) {
    // 同期処理
    (async function () {

        var client = new Client({
            user: 'postgres',
            host: '35.194.119.86',
            database: 'postgres',
            password: 'root',
            port: 5432
        });
        client.connect();

        // スキーマセット
        await setSchema(client);

        // 認証情報取得
        const selectRes = await selectAuth(client);

        // トークンリフレッシュ;
        const refreshJson = await cm.tokenRefresh(selectRes.rows[0].refresh_token);
        //const refreshJson = await cm.tokenRefresh('aaaaaa');

        if (!refreshJson) {
            var err = new Error('トークンリフレッシュ失敗');
            err.status = 400;
            res.render('error', {
                message: err.message,
                error: err
            });
        }
        cm.setAccessToken(refreshJson.access_token);
        cm.setRefreshToken(refreshJson.refresh_token);

        // 認証情報更新
        await updateAuth(client, refreshJson.access_token, refreshJson.refresh_token);

        // ユーザーID取得
        const userId = await getUserId();
        console.log('userId:' + userId);
        if (!userId) {
            var err = new Error('ユーザー情報取得失敗');
            err.status = 400;
            res.render('error', {
                message: err.message,
                error: err
            });
        }

        // ミーティングリスト取得
        const meetings = await getListMeetings(userId);
        if (!userId) {
            var err = new Error('ミーティング情報リスト取得失敗');
            err.status = 400;
            res.render('error', {
                message: err.message,
                error: err
            });
        }
        console.log("meetings.length:" + meetings.length);

        meetings.forEach(function (meeting, i) {
            console.log('----------meeting----------');
            console.log(meeting);
        })

        res.render('meetings', { meetings: meetings });
    })();
});

/* スキーマセット */
function setSchema(client) {
    return new Promise(function (resolve, reject) {
        client.query('SET search_path = zoomapi_test', (err, result) => {
            if (err) {
                logger.debug(err.stack);
            }
            resolve(null);
        });
    });
}

/* 認証情報取得 */
function selectAuth(client) {
    return new Promise(function (resolve, reject) {
        client.query('SELECT * FROM authentication WHERE auth_id = 1', (err, result) => {
            if (err) {
                logger.debug(err.stack);
                resolve(null);
            } else {
                resolve(result);
            }
        });
    });
}

/* 認証情報更新 */
function updateAuth(client, access, refresh) {
    return new Promise(function (resolve, reject) {
        // 認証情報更新
        const update = {
            text: 'UPDATE authentication SET access_token = $1, refresh_token = $2 WHERE auth_id = 1;',
            values: [access, refresh]
        };

        client.query(update, (updateErr, updateResult) => {
            if (updateErr) {
                logger.debug(updateErr.stack);
            }
            resolve(null);
        });
    });
}



/* Get a User API実行 */
function getUserId() {
    return new Promise(function (resolve, reject) {
        // HTTPリクエストオプション設定
        const options = {
            url: 'https://api.zoom.us/v2/users/me',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + cm.getAccessToken()
            }
        }
        //  HTTPリクエスト実行
        request(options, function (error, res, body) {
            console.log('getUserId_body:' + body);
            if (!error && res.statusCode == 200) {
                // JSONパース
                const json = JSON.parse(body);
                resolve(json.id);
            } else {
                console.log('getUserId_error:' + error);
                resolve(null);
            }

        });
    });
}

/* List Meetings API実行 */
function getListMeetings(userId) {
    return new Promise(function (resolve, reject) {
        // HTTPリクエストオプション設定
        const options = {
            url: 'https://api.zoom.us/v2/users/' + userId + '/meetings',
            method: 'GET',
            qs: {
                type: 'scheduled'
            },
            headers: {
                'Authorization': 'Bearer ' + cm.getAccessToken()
            }

        }
        //  HTTPリクエスト実行
        request(options, function (error, res, body) {
            console.log('getUserId_body:' + body);
            if (!error && res.statusCode == 200) {
                // JSONパース
                const json = JSON.parse(body);
                resolve(json.meetings);
            } else {
                console.log('getUserId_error:' + error);
                resolve(null);
            }

        });
    });
}

module.exports = router;