module.exports = {
	name: 'me',
	description: 'profile info!',
	async execute (client, msg, args) {
            // get the delete count, as an actual number.
            const userID = args[0];
            const target = msg.mentions.users.first() || userID || msg.author; // Grab the target.
        
            const user = await fetchUser(userID || target.id); // Selects the target from the database.
            //const user = await userModel.find({totalTime : });
            const pos = await userModel
              .find({ totalTime: { $gt: user.totalTime /* targetScore */ } })
              .countDocuments();
            //get users week position
            const monthPos = await userModel
              .find({ monthlyTime: { $gt: user.monthlyTime /* targetScore */ } })
              .countDocuments();
            //get users all time rank
            const weekPos = await userModel
              .find({ weekTime: { $gt: user.weekTime /* targetScore */ } })
              .countDocuments();
        
            if (!user)
              return msg.channel.send(
                "Seems like this user has not earned any minutes so far."
              ); // If there isnt such user in the database, we send a message in general.
        
            let embed = new Discord.MessageEmbed().setColor(config.embedColor);
            embed.setTitle(client.users.cache.get(user._id).tag);
            embed.setThumbnail(client.users.cache.get(user._id).displayAvatarURL());
            embed.setImage("https://i.imgur.com/Q0pP3Td.png");
            //embed.addField("#Today", `${m2h(user.dayTime)} Rank#${todayPos + 1}`);
            embed.addFields(
              {
                name: `:moneybag: XP :  **${parseInt(user.xp)}**`,
                value: `Need : ${xpFor(user.level + 1)} `,
                inline: true,
              },
              {
                name: `:medal: Level: **${user.level}**`,
                value: `Next : **${user.level + 1}** `,
                inline: true,
              }
            );
            embed.addField(
              ":sound: #Alltime ",
              `${m2h(user.totalTime)} :small_orange_diamond:  Rank#${pos + 1} `
            );
            embed.addField(
              ":sound: #This Month ",
              `${m2h(user.monthlyTime)} :small_orange_diamond:  Rank#${monthPos + 1} `
            );
        
            embed.addField(
              ":sound: #This Week ",
              `${m2h(user.weekTime)} :small_orange_diamond:  Rank#${weekPos + 1} `
            );
            //embed.addField("#Last-Session", `${m2h(user.lastSession)}`);
            //embed.setFooter("______________________________");
            embed.setFooter(
              "__© Study Livestream Crew__",
              client.user.displayAvatarURL()
            );
        
            msg.channel.send(embed);
	},
};


/**
 * @param {string} [userId] - Discord user id.
 */

async function fetchUser(userId) {
    if (!userId) throw new TypeError("An user id was not provided.");
  
    const user = await userModel.findOne({ _id: userId });
    if (!user) return false;
  
    return user;
  }
  