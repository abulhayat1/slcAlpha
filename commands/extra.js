if (msg.content === "?ldb") {
    ///////////////////////////////////////////
    const rawLeaderboard = await fetchLeaderboard(5); // We grab top 10 users with most xp in the current server.

    if (rawLeaderboard.length < 1) return reply("Nobody's in leaderboard yet.");

    const leaderboard = computeLeaderboard(client, rawLeaderboard); // We process the leaderboard.

    /*
    const lb = leaderboard.map(
      (e) =>
        `${e.totalTime}. ${e.username}#${e.discriminator}\nLevel: ${
          e.totalTime
        }\nXP: ${e.totalTime.toLocaleString()}`
    ); // We map the outputs.
        */
    msg.channel.send(leaderboard);
    // msg.channel.send(`**Leaderboard**:\n\n${lb.join("\n\n")}`);

    //console.log(rawLeaderboard);
    //message.channel.send(`**Leaderboard**:\n\n${lb.join("\n\n")}`);
  }


    // if (command === "top") {
  //   ///////////////////////////////////////////

  //   const sendEmbed = async () => {
  //     userModel
  //       .find({})
  //       .sort([["totalTime", "descending"]])
  //       .exec((err, res) => {
  //         let embed = new Discord.MessageEmbed().setColor(config.embedColor);
  //         embed.setTitle("SLC's Leaderboard! - :calendar: `ALL TIME`");
  //         embed.setDescription("Here is our top 12 Users - ALL TIME !");
  //         embed.setThumbnail(client.user.displayAvatarURL());
  //         //embed.setFooter("", bot.user.displayAvatarURL);
  //         //embed.setFooter("______________________________");
  //         if (res.length === 0) {
  //           embed.setDescription("As yet, the table for this server is empty.");
  //         } else if (res.length < 10) {
  //           for (i = 0; i < res.length; i++) {
  //             let name =
  //               client.users.cache.get(res[i]._id).tag || "User Not Found";
  //             if (name == "User Not Found") {
  //               embed.addField(
  //                 `${i + 1}. ${name}`,
  //                 `ALL-TIME: ${m2h(res[i].totalTime)} :alarm_clock:`
  //               );
  //             } else {
  //               embed.addField(
  //                 `${i + 1}. ${name}`,
  //                 `ALL-TIME: ${m2h(res[i].totalTime)}  :alarm_clock:`
  //               );
  //             }
  //           }
  //         } else {
  //           for (i = 0; i < 12; i++) {
  //             let name =
  //               client.users.cache.get(res[i]._id).tag || "User Not Found";

  //             if (name == "User Not Found") {
  //               embed.addField(
  //                 `${i + 1}. __***${name}***__\n`,
  //                 `ALL-TIME: ${m2h(res[i].totalTime)} }  :alarm_clock: `
  //               );
  //             } else {
  //               embed.addField(
  //                 `${i + 1}. __***${name}***__\n`,
  //                 `ALL-TIME: ${m2h(res[i].totalTime)} :alarm_clock: `
  //               );
  //             }
  //           }
  //         }
  //         msg.channel.send(embed);
  //       });
  //   };

  //   sendEmbed();
  // }

  // if (command === "topm") {
  //   ///////////////////////////////////////////

  //   const sendEmbed = async () => {
  //     userModel
  //       .find({})
  //       .sort([["monthlyTime", "descending"]])
  //       .exec((err, res) => {
  //         let embed = new Discord.MessageEmbed().setColor(config.embedColor);
  //         embed.setTitle("SLC's Leaderboard! - :calendar: `Monthly` ");
  //         embed.setDescription("Here is our top 12 Users !");
  //         embed.setThumbnail(client.user.displayAvatarURL());
  //         //embed.setFooter("", bot.user.displayAvatarURL);
  //         //embed.setFooter("______________________________");
  //         if (res.length === 0) {
  //           embed.setDescription("the table for this server is empty.");
  //         } else if (res.length < 10) {
  //           for (i = 0; i < res.length; i++) {
  //             let name =
  //               client.users.cache.get(res[i]._id).tag || "User Not Found";
  //             if (name == "User Not Found") {
  //               embed.addField(
  //                 `${i + 1}. ${name}`,
  //                 `This Month: ${m2h(res[i].monthlyTime)} `
  //               );
  //             } else {
  //               embed.addField(
  //                 `${i + 1}. ${name}`,
  //                 `This Month: ${m2h(res[i].monthlyTime)} `
  //               );
  //             }
  //           }
  //         } else {
  //           for (i = 0; i < 12; i++) {
  //             let name =
  //               client.users.cache.get(res[i]._id).tag || "User Not Found";

  //             if (name == "User Not Found") {
  //               embed.addField(
  //                 `${i + 1}. __***${name}***__\n`,
  //                 `This Month: ${m2h(res[i].monthlyTime)} `
  //               );
  //             } else {
  //               embed.addField(
  //                 `${i + 1}. __***${name}***__\n`,
  //                 `This Month: ${m2h(res[i].monthlyTime)} `
  //               );
  //             }
  //           }
  //         }
  //         msg.channel.send(embed);
  //       });
  //   };

  //   sendEmbed();
  // }

  // if (command === "topw") {
  //   ///////////////////////////////////////////

  //   const sendEmbed = async () => {
  //     userModel
  //       .find({})
  //       .sort([["weekTime", "descending"]])
  //       .exec((err, res) => {
  //         let embed = new Discord.MessageEmbed().setColor(config.embedColor);
  //         embed.setTitle("SLC's Leaderboard! - :calendar: `Weekly` ");
  //         embed.setDescription("Here is our top 12 Users !");
  //         embed.setThumbnail(client.user.displayAvatarURL());
  //         //embed.setFooter("", bot.user.displayAvatarURL);
  //         //embed.setFooter("______________________________");
  //         if (res.length === 0) {
  //           embed.setDescription("the table for this server is empty.");
  //         } else if (res.length < 10) {
  //           for (i = 0; i < res.length; i++) {
  //             let name =
  //               client.users.cache.get(res[i]._id).tag || "User Not Found";
  //             if (name == "User Not Found") {
  //               embed.addField(
  //                 `${i + 1}. ${name}`,
  //                 `This Week: ${m2h(res[i].weekTime)} `
  //               );
  //             } else {
  //               embed.addField(
  //                 `${i + 1}. ${name}`,
  //                 `This Week: ${m2h(res[i].weekTime)} `
  //               );
  //             }
  //           }
  //         } else {
  //           for (i = 0; i < 12; i++) {
  //             let name =
  //               client.users.cache.get(res[i]._id).tag || "User Not Found";

  //             if (name == "User Not Found") {
  //               embed.addField(
  //                 `${i + 1}. __***${name}***__\n`,
  //                 `This Week: ${m2h(res[i].weekTime)} `
  //               );
  //             } else {
  //               embed.addField(
  //                 `${i + 1}. __***${name}***__\n`,
  //                 `This Week: ${m2h(res[i].weekTime)} `
  //               );
  //             }
  //           }
  //         }
  //         msg.channel.send(embed);
  //       });
  //   };

  //   sendEmbed();
  // }


  if (command === "l") {
    ///////////////////////////////////////////
    //await CalculateTotalTimeOnInterval(guildID).then(onlineOnReset(guildID));

    // get the delete count, as an actual number.
    const pageNo = parseInt(args[0], 10);

    userModel
      .find({})
      .sort([["totalTime", "descending"]])
      .exec((err, res) => {
        let embed = new Discord.MessageEmbed().setColor(config.embedColor);
        embed.setTitle("SLC's Leaderboard!");
        embed.setDescription("Here is our top 12 Users - ALL TIME !");
        embed.setThumbnail(client.user.displayAvatarURL());
        //embed.setFooter("", bot.user.displayAvatarURL);
        //embed.setFooter("______________________________");
        if (res.length === 0) {
          embed.setDescription("As yet, the table for this server is empty.");
        } else if (res.length < 10) {
          for (i = 0; i < res.length; i++) {
            let name =
              client.users.cache.get(res[i]._id).tag || "User Not Found";
            if (name == "User Not Found") {
              embed.addField(
                `${i + 1}. ${name}`,
                ` This Month: ${m2h(res[i].totalTime)} :alarm_clock:`
              );
            } else {
              embed.addField(
                `${i + 1}. ${name}`,
                ` This Month: ${m2h(res[i].totalTime)}  :alarm_clock:`
              );
            }
          }
        } else {
          for (i = 0; i < pageNo; i++) {
            let name =
              client.users.cache.get(res[i]._id).tag || "User Not Found";

            if (name == "User Not Found") {
              embed.addField(
                `${i + 1}. __***${name}***__\n\n`,
                ` This Month: ${m2h(res[i].totalTime)} }  :alarm_clock: `
              );
            } else {
              embed.addField(
                `${i + 1}. __***${name}***__\n\n`,
                ` This Month: ${m2h(res[i].totalTime)} :alarm_clock: `
              );
            }
          }
        }
        msg.channel.send(embed);
      });
  }


   

  if (msg.content === "resetDay") {
    const resultr = await resetDay(guildID);
    const resultO = await onlineOnReset(guildID);

    msg.reply("done");
  }