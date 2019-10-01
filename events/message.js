const Discord = require('discord.js');
const sql = require("sqlite");
const random = require("../objects/random.json");
const random2 = require("../objects/random2.json");
module.exports = async (client, message) => {

	if(message.author.bot) return;
	if(message.channel.type === "dm") return;
	if(!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;

	if(message.mentions.everyone) message.react(client.emojis.get("519919364485677066")).catch(e => { return; });

	if(!talkedRecently.has(`${message.author.id}|${message.guild.id}`)){
		talkedRecently.add(`${message.author.id}|${message.guild.id}`);
		const points = await sql.get(`SELECT * FROM points WHERE user = "${message.author.id}" AND guild = "${message.guild.id}"`);
		if(!points){
			sql.run(`INSERT INTO points (guild, user, amount) VALUES ("${message.guild.id}", "${message.author.id}", "1")`).then(() => {
				client.log(`Added "${message.author.tag}" from the "${message.guild.name}" server.`, "SQL");
			});
		} else {
			sql.run(`UPDATE points SET amount = "${points.amount + 1}" WHERE user = "${message.author.id}" AND guild = "${message.guild.id}"`);
		}
		setTimeout(() => { talkedRecently.delete(`${message.author.id}|${message.guild.id}`); }, 10000);
	}

	const str = message.content.toLowerCase();
	if(random[message.content]){
		return message.channel.send(random[message.content]);
	} else
	if(random2[str]){
		return message.channel.send(random2[str]);
	}

	const guildData = await sql.get(`SELECT * FROM settings WHERE guild = "${message.guild.id}"`);
	const level = client.permlevel(message, guildData);
	const regicide = /(https?:\/\/)?(discord\.gg\/)([^\s]*)/gi;
	const serverAd = message.content.match(regicide);
	if(serverAd && level < 3){
		if(message.channel.permissionsFor(message.guild.me).has("MANAGE_MESSAGES"));{
			message.delete();
			message.reply("Advertising for random discord servers is Illegal.\nIf this is a mistake, please get a moderator to post the server link.");
		}
	}

	const mention = new RegExp(`^<@!?${client.user.id}>`);
	const mentionCheck = message.content.match(mention) ? message.content.match(mention)[0] : '!';

	const prefixes = [`${mentionCheck} `, guildData.prefix];
	let prefix = false;
	for(const thisPrefix of prefixes){
		if(message.content.startsWith(thisPrefix)) prefix = thisPrefix;
	}
	if(!prefix) return;

	let args = message.content.replace(/(?:\r\n|\r|\n)/g, "\u200b").split(/\s+/g);

	let command;
	if(args[0] === mentionCheck){
		args = args.slice(1);
		command = args.shift().toLowerCase();
	} else {
		command = args.shift().slice(prefix.length).toLowerCase();
	}
	const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

	if(cmd && level >= cmd.conf.permLevel){
		if(cmd.conf.enabled === true){
			const string = "Due to the nature of this bot, it requires embed permissions to run certain commands.\nPlease grant the bot embed permissions and try the command again.";
			if(!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(string);
			cmd.run(client, message, args, level);
		} else {
			client.log(`"${message.author.tag}" tried to use the disabled command "${cmd.help.name}"`, "Log");
		}
	} else if(cmd && level < cmd.conf.permLevel){
		client.log(`"${message.author.tag}" tried to use command: "${cmd.help.name}"`, "Log");
	}
	if(!cmd){
		const cc = await sql.all(`SELECT * FROM commands WHERE guild = "${message.guild.id}"`);
		const cmdList = {};
		cc.forEach(data => cmdList[data.name] = data.output);
		if(cmdList[command]) return message.channel.send(cmdList[command]);
	}
};

module.exports.help = {
	name: "message",
	description: "Emitted when a user sends a message",
};
