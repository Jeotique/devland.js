const p = require('phin').promisified;

exports.getGatewayBot = async (token) => {
    if (!token || typeof(token) != 'string' || token == '') throw new TypeError(`The token provided must not be empty or a wrong type`);

    try {
        const b = await p({
            url: 'https://discordapp.com/api/gateway/bot',
            parse: 'json',
            headers: {
                'Authorization': `Bot ${token}`
            }
        }).catch(err => { throw new Error(err)});
        if(b.body.code === 0) throw new Error("Token is invalid, can't access to the gateway")
        return b.body.url;
    } catch(err) {
        throw new Error(err);
    }
}