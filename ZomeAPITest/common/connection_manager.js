/* コネクションマネージャー */
class connection_manager {
    constructor(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
    getAccessToken() {
        return this.accessToken;
    }

    setAccessToken(accessToken) {
        this.accessToken = accessToken;
    }

    getRefreshToken() {
        return this.refreshToken;
    }

    setRefreshToken(refreshToken) {
        this.refreshToken = refreshToken;
    }

    tokenRefresh() {
        const token = this.refreshToken;
        return new Promise(function (resolve, reject) {
            // HTTPリクエストオプション設定
            const options = {
                url: 'https://api.zoom.us/oauth/token',
                method: 'POST',
                qs: {
                    grant_type: 'refresh_token',
                    refresh_token: token
                },
                headers: {
                    'Authorization': 'Basic OHpjaVh3TElTV2RYWUR2VEx3WDZ3OnNCeWJkSDMyRlhCdVJQMk9UOTRhYzdpREtCWUlaMUU4'
                    //'Authorization': 'Basic dk94ZHM3NnlSRkc3cGVKdDNyeGZ3Zzo5WktzU1o4MjA3TVFldVdmbFNBNmowd3VaYnVCd08wUw=='
                }
            };
            // HTTPリクエスト実行
            var request = require('request'); //HTTPリクエストモジュール
            request(options, function (error, res, body) {
                console.log('refresh_body:' + body);
                if (!error && res.statusCode == 200) {
                    // JSONパース
                    const json = JSON.parse(body);
                    console.log('AccessToken:' + json.access_token);
                    console.log('RefreshToken:' + json.refresh_token);
                    resolve(json);
                } else {
                    console.log('refresh_error:' + error);
                    resolve(null);
                }
            });
        });
    }
}

// シングルトン化:
module.exports = new connection_manager('', '');