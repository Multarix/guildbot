module.exports = (client) => {
	const member = client.guilds.get("237543420543893505").members.random();
	const msg = Math.random() ? "Faggot" : "I love you";
	client.channels.get("237543420543893505").send(`${member} ${msg}`).catch(e => { return; });
};
