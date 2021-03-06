const Discord = require('discord.js');
exports.run = async (client, message, args) => {

	const players = client.users.cache;
	const res = sqlAll("SELECT * FROM points WHERE guild = ? ORDER BY amount DESC", message.guild.id);
	let ecolor = 13238272;
	if(message.guild.me.roles.highest.color) ecolor = message.guild.me.roles.highest.color;
	const embed = new Discord.MessageEmbed()
		.setAuthor(`Point Leaderboard - ${message.guild.name}`)
		.setColor(ecolor)
		.addField("**Rank #1** :crown:", `**${res[0].amount}** Points - **${players.get(`${res[0].user}`).tag}**`, false)
		.setTimestamp()
		.setFooter(client.user.tag);

	if(message.guild.iconURL) embed.setThumbnail(message.guild.iconURL);

	let i = 0;
	while(i <= res.length && i < 4){
		i += 1;
		embed.addField(`**Rank #${i + 1}**`, `**${res[i].amount}** Points - **${players.get(`${res[i].user}`).tag}**`, false);
	}

	return message.channel.send({ embed });
};

exports.conf = {
	enabled: true,
	allowDM: false,
	aliases: ["ranking", "rankings", "ranks"],
	permLevel: 0
};

exports.help = {
	name: "rank",
	category: "Misc",
	description: "Lists the users with the top 5 amount of points",
	usage: ".."
};
