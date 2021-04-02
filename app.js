const config = require('config');
const { App } = require('@slack/bolt');

const Knex = require('knex');
const knexConfig = require('./knexfile');

const { Model } = require('objection');
const { User } = require('./models/User');

var environment = process.env.NODE_ENV;

const knex = Knex(knexConfig[environment]);

Model.knex(knex);

// Initializes your app with your bot token and signing secret
const app = new App({
    token: config.slack.bot_token,
    signingSecret: config.slack.signing_secret
});

const getChartUrl = function (vaccinated, unvaccinated, total) {

    var a = (vaccinated / total) * 100;
    var b = (unvaccinated / total) * 100;
    var c = ((total - vaccinated - unvaccinated) / total) * 100;

    var data = [];
    var labels = [];
    var colors = [];

    if (vaccinated > 0) {
        data.push(a);
        labels.push('Vaccinated');
        colors.push('88BFB0');
    }
    if (unvaccinated > 0) {
        data.push(b);
        labels.push('Unvaccinated');
        colors.push('F2695C');
    }
    if ((total - vaccinated - unvaccinated) > 0) {
        data.push(c);
        labels.push('Unknown');
        colors.push('F2A663');
    }

    return 'https://image-charts.com/chart?chco=' + colors.join('%2C') + '&chd=t%3A' + data.join('%2C') + '&chf=a%2Cs%2C00000000&chl=' + labels.join('%7C') + '&chma=25%2C15&chs=200x200&cht=p';

}

const displayStatus = async function (client, channelId) {

    try {

        const membersResult = await client.conversations.members({
            channel: channelId,
        });

        var vaccinated = 0;
        var unvaccinated = 0;
        var total = membersResult.members.length;

        var botInChannel = true;
        if (botInChannel) {
            total--;
        }

        const members = await User.query().whereIn('user_id', membersResult.members);

        members.forEach(function(user) {
            if (user.status === 'vaccinated') {
                vaccinated++;
            } else if (user.status === 'not_vaccinated') {
                unvaccinated++;
            }
        });

        // Call chat.postMessage with the built-in client
        const result = await client.chat.postMessage({
            channel: channelId,
            blocks: [
                {
                    "type": "image",
                    "image_url": getChartUrl(vaccinated, unvaccinated, total),
                    "alt_text": "vaccination status chart"
                }
            ]
        });
        console.log(result);
    }
    catch (error) {
        console.error(error);
    }

}

const displayButtons = async function (client, channelId) {

    try {

        // Call chat.postMessage with the built-in client
        const result = await client.chat.postMessage({
            channel: channelId,
            blocks: [
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "I'm vaccinated"
                            },
                            "style": "primary",
                            "value": "vaccinated",
                            "action_id": "set_vaccinated",
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "I'm not vaccinated"
                            },
                            "style": "danger",
                            "value": "not_vaccinated",
                            "action_id": "set_not_vaccinated",
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Clear status"
                            },
                            "value": "clear",
                            "action_id": "clear_status",
                        },
                    ]
                }
            ]
        });
        console.log(result);
    }
    catch (error) {
        console.error(error);
    }

}

app.event('app_mention', async ({ event, client }) => {
    await displayStatus(client, event.channel);
    await displayButtons(client, event.channel);
});

const updateStatus = async function(teamId, userId, status) {

    const user = await User.query().findOne({
        team_id: teamId,
        user_id: userId,
    }).patch({
        status: status,
    });

    if (!user) {

        await User.query().insert({
            team_id: teamId,
            user_id: userId,
            status: status,
        });

    }

}

const deleteStatus = async function (teamId, userId) {

    const user = await User.query().findOne({
        team_id: teamId,
        user_id: userId,
    });

    if (user) {
        await User.query().deleteById(user.id);
    }

}

app.action('set_vaccinated', async ({ body, ack, say, client }) => {
    await ack();
    console.log(body);
    await say(`<@${body.user.id}> marked themselves as vaccinated.`);
    await updateStatus(body.team.id, body.user.id, 'vaccinated');
    await displayStatus(client, body.channel.id);
    await displayButtons(client, body.channel.id);
});

app.action('set_not_vaccinated', async ({ body, ack, say, client }) => {
    await ack();
    console.log(body);
    await say(`<@${body.user.id}> marked themselves as not vaccinated.`);
    await updateStatus(body.team.id, body.user.id, 'not_vaccinated');
    await displayStatus(client, body.channel.id);
    await displayButtons(client, body.channel.id);
});

app.action('clear_status', async ({ body, ack, say, client }) => {
    await ack();
    console.log(body);
    await say(`<@${body.user.id}> cleared their vaccination status.`);
    await deleteStatus(body.team.id, body.user.id);
    await displayStatus(client, body.channel.id);
    await displayButtons(client, body.channel.id);
});

(async () => {
    // Start your app
    await app.start(config.port || 8080);
    console.log('⚡️ Bolt app is running!');
})();