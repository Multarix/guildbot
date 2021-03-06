const Discord = require('discord.js');
const moment = require("moment");
require("moment-duration-format");
exports.run = async (client, message, args) => {

	let user = message.author;
	let member = message.member;

	let tagged;
	if(args[0]) tagged = await grabUser(args[0]);

	if(tagged){
		user = tagged;
		member = await message.guild.members.fetch(tagged).catch(e => { return undefined; });
	}

	const joinDate = moment.duration(Date.now() - user.createdTimestamp).format("Y [years], M [months], D [days]");

	let game = "nothing";
	if(user.presence.activity) game = user.presence.activity.name;

	let displayName = user.username;
	if(member) displayName = member.displayName;

	const embed = new Discord.MessageEmbed()
		.setAuthor(displayName)
		.setThumbnail(user.displayAvatarURL())
		.addField("Username:", user.username, true)
		.addField("Discrim:", user.discriminator, true)
		.addField("Discord ID:", user.id, true)
		.addField("Is bot?", user.bot.toString().toProperCase(), true)
		.addField("Status:", user.presence.status.toProperCase(), true)
		.addField("Playing:", game, true)
		.addField("Joined Discord:", `${joinDate} ago`, false)
		.setTimestamp()
		.setFooter(client.user.tag, client.user.displayAvatarURL());

	let ecolor1 = 14487568;
	if(member){
		if(member.roles.highest.color) ecolor1 = member.roles.highest.color;
		if(member.roles){
			const s = function(a, b){ return a.position - b.position; };
			const r = member.roles.cache.array().sort(s).slice(1).reverse().join(", ");
			embed.addField("Roles:", `\u200b${r}`);
		}
	}
	embed.setColor(ecolor1);
	return message.channel.send({ embed });
};

exports.conf = {
	enabled: true,
	allowDM: true,
	aliases: ["uinfo", "ui", "user"],
	permLevel: 0
};

exports.help = {
	name: "userinfo",
	category: "Misc",
	description: "Grabs information about a user",
	usage: "..user"
};
