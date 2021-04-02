# dumbreka

A bot for tracking COVID-19 vaccination status of a Slack channel.

<img width="399" alt="dumbreka" src="https://user-images.githubusercontent.com/57770/113428811-51157f80-938c-11eb-99d9-15d354bb74d6.png">

## Installation

```
npm install
npm install knex@0.21.19 -g 
```

Create a new Slack app.

### Features :: OAuth & Permissions

**Scopes -> Bot Token Scopes:**

* app_mentions:read
* channels:read
* chat:write

### Features :: Event Subscriptions

Enable Events: On

Request URL: `{$DOMAIN}/slack/events`

Subscribe to bot events: `app_mention`

### Settings :: Install App

**Install to workspace**

### Settings :: Basic Information

Copy `config/default.json5` to `config/local.json5` and fill in the information.

Initialize the sqlite DB:
```
NODE_ENV=dev knex migrate:latest
```

Start the server:
```
npm run pm2
```

Start ngrok:
```
ngrok http -bind-tls=true -subdomain={$SUBDOMAIN} 8080
```

## Installation (production)

```
npm install
npm install knex@0.21.19 -g 
```

Copy `config/default.json5` to `config/prod.json5` and fill in the information.

Initialize the sqlite DB:
```
NODE_ENV=prod knex migrate:latest
```

Start the server:
```
pm2 start ecosystem.config.js --env production
```

## Usage

Invite the bot to the Slack channel:
```
/invite @dumbreka
```

@mention the bot to get the ball rolling:
```
@Dumbreka
```

## License

MIT
