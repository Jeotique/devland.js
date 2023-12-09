<div align="center">
	<p>
		<a href="https://discord.gg/4tsZfXrRDR"><img src="https://img.shields.io/discord/1063182666519814206?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/devland.js"><img src="https://img.shields.io/npm/v/devland.js.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/devland.js"><img src="https://img.shields.io/npm/dt/devland.js.svg?maxAge=3600" alt="npm downloads" /></a>
	</p>
</div>

## Links
- [Discord server](https://discord.gg/4tsZfXrRDR)
- [Documentation](https://devland.mxtorie.xyz)
- [GitHub](https://github.com/Jeotique/devland.js)
- [Discord API](https://discord.gg/discord-api)
- [NPM](https://www.npmjs.com/package/devland.js)

## Need help ?
If you need help with the module you can take a look to the [documentation](https://devland.mxtorie.xyz/) or come into our [discord server](https://discord.gg/4tsZfXrRDR).

## You found a bug ?
If you found a bug you can just open a [issue](https://github.com/Jeotique/devland.js/issues) by explaining this one.
You can report it on our [discord server](https://discord.gg/4tsZfXrRDR) too.

## Let's start
_This is a little part present in our documentation._

```js
const {Client, IntentFlags} = require("devland.js")
const bot = new Client({
    intents: [IntentFlags.FLAGS.GUILDS, IntentFlags.FLAGS.GUILD_MEMBERS, IntentFlags.FLAGS.GUILd_PRESENCES]
    guildsLifeTime: 7200000, 
    // here we ask to the module to cache all guilds during 2h
    // after all events with a guild as target, the life time will be reset to 2h
    connect: true,
    // represent the auto-connect, if true you will need to provid the token here
    token: "YOUR TOKEN" 
    //token is optional if 'connect' is on false, you will be invited to put
    // the token in the next page (Connect Client)
})

bot.on('ready', () => console.log(`${bot.user.tag} connected`))
```
**All cache options available for the client :**
```js
guildsLifeTime: milliseconds, //will unlock bot.guilds
channelsLifeTime: milliseconds, //will unlock bot.<type>Channels (ex : bot.textChannels)
usersLifeTime: milliseconds, //will unlock bot.users
messagesLifeTime: milliseconds, //will unlock bot.messages
threadsLifeTime: milliseconds, //will unlock bot.threadChannels
membersLifeTime: milliseconds, //will unlock <guild>.members
rolesLifeTime: milliseconds, //will unlock <guild>.roles
invitesLifeTime: milliseconds, //will unlock <guild>.invites
presencesLifeTime: milliseconds, //will unlock <guild>.presences & <member>.presence
voicesLifeTime: milliseconds, //will unlock <guild>.voicesStates & <member>.voice
enableAllCaches: //will unlock all caches of the client
waitCacheBeforeReady: boolean, //wait for all caches enabled to be completed before emit the ready event, by default set to true
fetchAllMembers: boolean, //by default fetch all members in a guild
checkForUpdate: boolean, //check for a new update when the program is up

// warning, for the members, roles, presences, voices & invites cache the guilds cache must be enabled too
```
**All ws options available for the client :**
```js
large_threshold: number,
compress: boolean,
properties: propertiesOptions,

propertiesOptions = {
    $os: string | NodeJS.Platform,
    $browser: string,
    $device: string
}
```
**All presence options available for the client :**
```js
status: string, //dnd, online, invisible, idle, offline
afk: boolean,
activities: simpleActivity[],
since: number,

simpleActivity = {
    name: string,
    type: ActivityType,
    url: string,
}

ActivityType = {
    Game = 0,
    Streaming = 1,
    Listening = 2,
    Watching = 3,
    Custom = 4,
    Competing = 5
}
```

**All others options available for the client :**
```js
connectionTimeout: number, //how many time before throwing a error if still not connected, default set to 30000 (30s)
maxReconnectAttempts: number, //how attempts to reconnect the gateway after a error, default set to Infinity
maxResumeAttempts: number, //how many attempts to resume the gateway connection after a disconnect, default set to 10
invalidCommandValueReturnNull: boolean, //<interaction>.getCommandValue() must return a null value or undefined if invalid, default set to true (null returned)
```