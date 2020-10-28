//require("dotenv").config();

//web
var express = require("express");
var app = express();
var http = require("http");

app.set("port", process.env.PORT || 5000);

app.listen(app.get("port"), function () {
  console.log("Node app is running on port", app.get("port"));
});

// Send requests to the app every 9 minutes to keep it alive

app.get("/", function (req, res) {
  res.send("Error: ");
});


// Discord

const Discord = require("discord.js");
const client = new Discord.Client();
const mongoose = require("mongoose");
const moment = require("moment");
const mongoosePaginate = require("mongoose-paginate-v2");
const userModel = require("./model/user");
const configModel = require("./model/config");

//config
const prefix = ".";
const guildID = "705025151045074975";
//voice hour will not be counted in this channels
const nonStudy = [
  "730450848915914792",
  "722237135939174441",
  "705065263732752465",
  "705065338173259798",
  "716643291663302737",
];
const embedColor = {
  embedColor: "0x2ecc71",
  embedColor2: "3498db",
};


//----------------------------BOT---------------------------------------- -
//--------------------------------------------------------------------- -

mongoose
  .connect(process.env.Mongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => "You are now connected to Mongo!")
  .catch((err) => console.error("Something went wrong", err));

/////////////////////////////////////////////////////////
//READY
///////////////////////////////////////////////////////

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  setInterval(() => {
    let countUserVoice = 0;
    guild.voiceStates.cache.forEach(async (item) => {
      countUserVoice = countUserVoice + 1;
    });
    client.user.setActivity(`Voice Users : ${countUserVoice}`, {
      //url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      type: "WATCHING",
    });
    countUserVoice = 0;
  }, 1 * 60 * 1000);

  // setTimeout(async () => {
  //   await resetOnMessage().then(
  //     client.channels.get("761929698263302154").send("Hello here!")
  //   );
  // }, 4968000);

  ///-----------------------------------------
  //date week month reset
  //-----------------------------------------
  // setInterval(async function () {
  //   let configDBDate = await configModel.findById(guildID);
  //   todayDate = new Date();
  //   //if no date in db - then store new date

  //   if (!configDBDate.currentDate) {
  //     configDBDate.currentDate = new date();
  //     const result = await configDBDate.save();
  //     console.log(result);
  //   }
  //   //if date exits
  //   if (configDBDate.currentDate === newdate) {
  //     console.log("same day");
  //   }
  //   if (configDBDate.currentDate !== newdate) {
  //     console.log("new day");
  //   }
  // }, 6 * 1000); // 60 * 1000 milsec

  /*
  setInterval(async function () {
     let midnight = "0:00:00";
      let now = null;
    var time = "24:00:00";
    var now = moment(time, "HH:mm:ss").format("hh:mm:ss");
    //now = moment().format("H:mm:ss");
    if (now === midnight) {
      await resetDay(guildID);
    }
    console.log(now);
  }, 1000);
  */
  //-----------------------------------------
  //calculate total time failsafe - after restart
  //-----------------------------------------

  await CalculateTotalTime(guildID);

  //-----------------------------------------
  //refresh end time every 10 sec
  //--------------------------------------------
  let configDBTime = await configModel.findById(guildID);
  refreshTimeDB(configDBTime);

  //----------------------------------------
  //give online users a new timestamp
  //-----------------------------------------

  //get the users in voice channel
  let guild = client.guilds.cache.get(guildID);

  guild.voiceStates.cache.forEach(async (item) => {
    console.log(item.id);
    if(item.member.user.bot){
      return console.log("bot found");
    }
    if (
      item.channelID == nonStudy[0] ||
      item.channelID == nonStudy[1] ||
      item.channelID == nonStudy[2] ||
      item.channelID == nonStudy[3] ||
      item.channelID == nonStudy[4]
    ) {
      let user = await userModel.findById(item.id);
      if (user) {
        user.OnVoice = false;
        const result = await user.save();
        console.log("user is in non study voice channel");
      }
    } else {
      await updateUserState(item);
    }
  });

  ////////////////////////Refresh data every 5 minute////////////////////

  setInterval(async () => {
    await CalculateTotalTimeOnInterval();
  }, 2 * 60 * 1000);
});

/////////////////////////////////////////////////////////
//voice State Update
///////////////////////////////////////////////////////

client.on("voiceStateUpdate", async (oldState, newState) => {
  let oldVoice = oldState.channelID;
  let newVoice = newState.channelID;

  // Ignore bots
  if (oldState.member.bot || newState.member.bot) {
    return;
  }

  //----------------------------------------------------
  //----------------------------------------------------
  //User joined!
  //----------------------------------------------------
  //----------------------------------------------------

  if (oldVoice != newVoice) {
    if (oldVoice == null) {
      console.log("User joined!");

      console.log(newState.member.user.username);
      //save timestamp
      let startTime = new Date();

      ////////////////////////////////////////////
      if (
        //break
        newVoice !== nonStudy[0] &&
        //nap time
        newVoice !== nonStudy[1] &&
        //karaoke
        newVoice !== nonStudy[2] &&
        //games
        newVoice !== nonStudy[3] &&
        //slc cry
        newVoice !== nonStudy[4]
      ) {
        let user = await userModel.findById(newState.id);
        if (user) {
          user.startingTime = startTime;
          user.OnVoice = true;
          if (!user.userName) user.userName = newState.member.user.username;
        } else {
          user = new userModel({
            _id: newState.id,
            userName: newState.member.user.username,
            startingTime: startTime,
            OnVoice: true,
          });
        }
        const result = await user.save();
      }
      /////////////////////////////////////////////

      //----------------------------------------------------
      //----------------------------------------------------
      //User left!
      //----------------------------------------------------
      //----------------------------------------------------
    } else if (newVoice == null) {
      console.log("User left!");
      console.log(newState.member.user.username);
      //save time stamp

      let endTime = new Date();

      ////////////////////////////////////////////
      if (
        //break
        oldVoice !== nonStudy[0] &&
        //nap time
        oldVoice !== nonStudy[1] &&
        //karaoke
        oldVoice !== nonStudy[2] &&
        //games
        oldVoice !== nonStudy[3] &&
        //slc cry
        oldVoice !== nonStudy[4]
      ) {
        let user = await userModel.findById(newState.id);
        if (user) {
          let startTime = user.startingTime;

          //calculate time
          let diff = endTime.valueOf() - startTime.valueOf();
          let diffInHours = diff / 1000 / 60 / 60 / 60;
          console.log(diffInHours);

          user.dayTime += timeDifference(endTime, startTime);
          user.weekTime += timeDifference(endTime, startTime);
          user.monthlyTime += timeDifference(endTime, startTime);
          user.totalTime += timeDifference(endTime, startTime);
          user.lastSession = timeDifference(endTime, startTime);
          //make user offline from voice
          user.OnVoice = false;
          //user.startingTime = null;
          const result = await user.save();
          addXp(user.id,(timeDifference(endTime, startTime))/60)
          console.log(result);
        }
      } else {
        console.log("left ZZZZZZZZZZZZZZ");
        let user = await userModel.findById(newState.id);
        if (user) {
          user.OnVoice = false;
          const result = await user.save();
        }
      }

      //----------------------------------------------------
      //----------------------------------------------------
      //User switched channels!
      //----------------------------------------------------
      //----------------------------------------------------
    } else {
      console.log("User switched channels!");
      console.log(newVoice + "new");
      console.log(oldVoice + "old");
      //if old was not afk then add
      if (
        //break
        oldVoice !== nonStudy[0] &&
        //nap time
        oldVoice !== nonStudy[1] &&
        //karaoke
        oldVoice !== nonStudy[2] &&
        //games
        oldVoice !== nonStudy[3] &&
        //slc cry
        oldVoice !== nonStudy[4]
      ) {
        let endTime = new Date();
        let user = await userModel.findById(newState.id);
        if (user) {
          let startTime = user.startingTime;

          //calculate time
          let diff = endTime.valueOf() - startTime.valueOf();
          let diffInHours = diff / 1000 / 60 / 60 / 60;
          console.log(diffInHours);

          user.dayTime += timeDifference(endTime, startTime);
          user.weekTime += timeDifference(endTime, startTime);
          user.monthlyTime += timeDifference(endTime, startTime);
          user.totalTime += timeDifference(endTime, startTime);
          user.lastSession = timeDifference(endTime, startTime);
          //make user offline from voice
          user.OnVoice = false;
          //user.startingTime = null;
          const result = await user.save();
          addXp(user.id,(timeDifference(endTime, startTime))/60)
          console.log(result);
        }
      }

      // if new not afk then add a new time stamp in data database
      if (
        //break
        newVoice !== nonStudy[0] &&
        //nap time
        newVoice !== nonStudy[1] &&
        //karaoke
        newVoice !== nonStudy[2] &&
        //games
        newVoice !== nonStudy[3] &&
        //slc cry
        newVoice !== nonStudy[4]
      ) {
        let user = await userModel.findById(newState.id);
        let startTime = new Date();
        if (user) {
          user.startingTime = startTime;
          user.OnVoice = true;
          if (!user.userName) user.userName = newState.member.user.username;
        } else {
          user = new userModel({
            _id: newState.id,
            userName: newState.member.user.username,
            startingTime: startTime,
            OnVoice: true,
          });
        }
        const result = await user.save();
      }
    }
  }
});

////////////////////////////////////////////////
//COMAND HANDLE
///////////////////////////////////////////////

client.on("guildMemberUpdate", function(oldMember, newMember){
  console.error(`oldMember : ${oldMember.roles} \n  newMember : ${newMember.roles}`);
});


client.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);

  const command = args.shift().toLowerCase();

  if (command === "ping") {
    const m = await msg.channel.send("Ping?");
    m.edit(
      `Pong! Latency is ${
        m.createdTimestamp - msg.createdTimestamp
      }ms. API Latency is ${Math.round(client.ping)}ms`
    );
  }

  if (command === "me") {
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

    let embed = new Discord.MessageEmbed().setColor(embedColor.embedColor);
    embed.setTitle((await client.users.fetch(user._id)).tag);
    embed.setThumbnail((await client.users.fetch(user._id)).displayAvatarURL({dynamic : true}));
    embed.setImage("https://i.imgur.com/Q0pP3Td.png");
    //embed.addField("#Today", `${m2h(user.dayTime)} Rank#${todayPos + 1}`);
    embed.addFields(
      {
        name: `:moneybag: XP :  **${parseInt(user.xp)}**`,
        value: `Next Level @ : ${xpFor(user.level + 1)} `,
        inline: true,
      },
      {
        name: `:medal: Level: **${user.level}**`,
        value: `Progress to next level : **${((parseInt(user.xp)/parseInt(xpFor(user.level + 1)))*100).toFixed(0) }**% `,
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
  }

  if(command === "addr"){
     guild = client.guilds.cache.get(guildID);
    //const ans = msg.member.roles.has("705424854505095180")
    //const member = msg.mentions.members.first();
    let member = guild.members.cache.get("492728333449166859");
    let role = guild.roles.cache.find(r => r.name === "slcAlpha3(7-10)");
    member.roles.add(role).catch(console.error);
    //member.roles.remove("768468617581953046").catch(console.error);
    msg.reply(member)
  }

  // if (command === "reset") {
  //   await resetOnMessage().then(msg.reply("done"));
  // }

  if (command === "resetw") {
    if(!msg.member.roles.cache.some(r=>["slcAlphaPermission"].includes(r.name)) ) return msg.reply("Permission Missing");
    const confirmCode = parseInt(args[0], 10);
    if(confirmCode === 963852 ){
      await resetWeekOnMessage().then(msg.reply("Week Reset done"));
    }else{
      msg.reply("Wrong Code")
    }
  }


  //"admins", "helpers", "Tech Team", 
  if (command === "resetm") {
    if(!msg.member.roles.cache.some(r=>["slcAlphaPermission"].includes(r.name)) ) return msg.reply("Permission Missing");
    const confirmCode = parseInt(args[0], 10);
    if(confirmCode === 963852 ){
      await resetMonthOnMessage().then(msg.reply("Month Reset Done/Xp Reset Done"));
    }else{
    msg.reply("Wrong Code")
    }
  }


   //create roles 
  // if(command === "cr"){
  //   //if (msg.member.roles.cache.find(r => r.name === "slcAlphaNew")) return msg.reply('slcAlphaNew already exists')
  //   console.log("createRole invoked");
  //   const rolesName = ["slcAlpha1","slcAlpha2","slcAlpha3","slcAlpha4"]
  //   rolesName.forEach( (roleName) => {
  //     msg.guild.roles.create({
  //       data: {
  //         name: `${roleName}`,
  //         color: 'GREY',
  //       },
  //       reason: 'ops',
  //     })
  //       .then( r => msg.reply(`roles created ${r}`))
  //       .catch(console.error);  
  //   })
  // }

    //  //create roles 
    //  if(command === "cr"){
    //   if(!msg.member.roles.cache.some(r=>["slcAlphaPermission"].includes(r.name)) ) return msg.reply("Permission Missing");

    //   const config = await fetchConfig (guildID,true);
    //   const confirmCode = parseInt(args[0], 10);

    //   if( config.confirmCode === confirmCode){

    //     const rolesName = config.roles;
    //     console.log("createRole invoked");

    //     for(key in rolesName ){
    //       if (msg.guild.roles.cache.find(r => r.name === key)) {
    //         msg.reply(`${key} already exists`);
    //       }else{
    //       msg.guild.roles.create({
    //             data: {
    //               name: `${key}`,
    //               color: `${rolesName[key]}`,
    //             },
    //             reason: 'for level system',
    //           })
    //             .then( r => msg.reply(`roles created ${r}`))
    //             .catch(console.error);  
    //       }
    //     }
    //   }else{
    //     msg.reply("Wrong code. Try again.");
    //   }
    // }



    if(command === "cr"){
      if(!msg.member.roles.cache.some(r=>["slcAlphaPermission"].includes(r.name)) ) return msg.reply("Permission Missing");

      const config = await fetchConfig (guildID,true);
      const confirmCode = parseInt(args[0], 10);

      if( config.confirmCode === confirmCode){

        const rolesName = config.roles;
        console.log("createRole invoked");

        for(key in rolesName ){
          // if (msg.guild.roles.cache.find(r => r.name === key)) 
          //   msg.reply(`${key} already exists`);
          const guild = client.guilds.cache.get(guildID);
          const role = guild.roles.cache.find(r => r.name === key);
          //const role = message.guild.roles.cache.get("RoleID");
          msg.guild.roles.create({
            data: {
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            position: role.position,
            permissions: role.permissions,
            mentionable: role.mentionable
            }
            })
            role.delete()
            .then( r => msg.reply(`roles created ${r}`))
                .catch(console.error); 
          
        }
      }else{
        msg.reply("Wrong code. Try again.");
      }
    }
    
    if(command === "dr"){
      if(!msg.member.roles.cache.some(r=>["slcAlphaPermission"].includes(r.name)) ) return msg.reply("Permission Missing");

      const config = await fetchConfig (guildID,true);
      const confirmCode = parseInt(args[0], 10);
      const guild = client.guilds.cache.get(guildID);

      if( config.confirmCode === confirmCode){
        const rolesName = config.roles;
        console.log("delete role invoked");
        for(key in rolesName ){
          guild.roles.cache.find(role => role.name === key).delete();
        }
        msg.reply("roles deleted");
      }else{
        msg.reply("Wrong code. Try again.");
      }
    }
  

  if (command == "top" || command == "t") {
    // get the delete count, as an actual number.
    const pageNo = parseInt(args[0], 10);

    const getPagination = (page, size) => {
      const limit = size ? +size : 3;
      const offset = page ? page * limit : 0;

      return { limit, offset };
    };

    const { limit, offset } = getPagination(pageNo - 1, 12);

    //const rank = (res) => (res - 1) * 12;

    userModel
      .paginate({}, { sort: { totalTime: -1 }, offset, limit })
      .then( async (res) => {
        let embed = new Discord.MessageEmbed().setColor(embedColor.embedColor);
        embed.setTitle(
          `SLC's Leaderboard! - :calendar: ALL Time - Current Page: ${res.page} `
        );
        embed.setDescription("________________________");
        embed.setThumbnail(client.user.displayAvatarURL());
        //embed.setFooter("", bot.user.displayAvatarURL);
        //embed.setFooter("______________________________");
        if (res.docs.length === 0) {
          embed.setDescription("As yet, the table for this server is empty.");
        } else if (res.docs.length < 10) {
          for (i = 0; i < res.docs.length; i++) {

            const User = await client.users.fetch(res.docs[i]._id);
            const name = User.tag || "User Not Found";

            if (name == "User Not Found") {
              embed.addField(
                `${res.pagingCounter + i}. ${name}`,
                `\n❯ all time: ${m2h(res.docs[i].totalTime)}`
              );
            } else {
              embed.addField(
                `${res.pagingCounter + i}. ${name}`,
                `\n❯  all time: ${m2h(res.docs[i].totalTime)}`
              );
            }
          }
        } else {
          for (i = 0; i < 12; i++) {

            const User = await client.users.fetch(res.docs[i]._id);
            
            const name = User.tag || "User Not Found";

            
            
            if (name == "User Not Found") {
              embed.addField(
                `${res.pagingCounter + i}. __***${name}***__\n\n`,
                `\n❯  all time: ${m2h(res.docs[i].totalTime)} }`
              );
            } else {
              embed.addField(
                `${res.pagingCounter + i}. __***${name}***__\n\n`,
                `\n❯ all time: ${m2h(res.docs[i].totalTime)}`
              );
            }
          }
        }
        msg.channel.send(embed);
      });
  }

  if (command == "topm" || command == "tm" || command == "m" ) {
    // get the delete count, as an actual number.
    const pageNo = parseInt(args[0], 10);

    const getPagination = (page, size) => {
      const limit = size ? +size : 3;
      const offset = page ? page * limit : 0;

      return { limit, offset };
    };

    const { limit, offset } = getPagination(pageNo - 1, 12);

    //const rank = (res) => (res - 1) * 12;

    userModel
      .paginate({}, { sort: { monthlyTime: -1 }, offset, limit })
      .then(async (res) => {
        let embed = new Discord.MessageEmbed().setColor(embedColor.embedColor);
        embed.setTitle(
          `SLC's Leaderboard! - :calendar: Monthly | Current Page: ${res.page} `
        );
        embed.setDescription("________________________");
        embed.setThumbnail(client.user.displayAvatarURL());
        //embed.setFooter("", bot.user.displayAvatarURL);
        //embed.setFooter("______________________________");
        if (res.docs.length === 0) {
          embed.setDescription("As yet, the table for this server is empty.");
        } else if (res.docs.length < 10) {
          for (i = 0; i < res.docs.length; i++) {

            const User = await client.users.fetch(res.docs[i]._id);
            const name = User.tag || "User Not Found";

            if (name == "User Not Found") {
              embed.addField(
                `${i + 1}. ${name}`,
                `\n❯ This Month: ${m2h(res.docs[i].monthlyTime)}`
              );
            } else {
              embed.addField(
                `${i + 1}. ${name}`,
                `\n❯ This Month: ${m2h(res.docs[i].monthlyTime)}`
              );
            }
          }
        } else {
          for (i = 0; i < 12; i++) {
            const User = await client.users.fetch(res.docs[i]._id);
            
            const name = User.tag || "User Not Found";

            if (name == "User Not Found") {
              embed.addField(
                `${pageNo + 1}. __***${name}***__\n\n`,
                `\n❯ This Month: ${m2h(res.docs[i].monthlyTime)} }`
              );
            } else {
              embed.addField(
                `${res.pagingCounter + i}. __***${name}*** :medal: **${res.docs[i].level}**__\n\n`,
                `\n❯ This Month: ${m2h(res.docs[i].monthlyTime)}`
              );
            }
          }
        }
        msg.channel.send(embed);
      });
  }

  if (command == "topw" || command == "tw" || command == "w" ) {
    // get the delete count, as an actual number.
    const pageNo = parseInt(args[0], 10);

    const getPagination = (page, size) => {
      const limit = size ? +size : 3;
      const offset = page ? page * limit : 0;

      return { limit, offset };
    };

    const { limit, offset } = getPagination(pageNo - 1, 12);

    //const rank = (res) => (res - 1) * 12;

    userModel
      .paginate({}, { sort: { weekTime: -1 }, offset, limit })
      .then(async (res) => {
        let embed = new Discord.MessageEmbed().setColor(embedColor.embedColor);
        embed.setTitle(
          `SLC's Leaderboard! - :calendar: Weekly - Current Page: ${res.page} `
        );
        embed.setDescription("________________________");
        embed.setThumbnail(client.user.displayAvatarURL());
        //embed.setFooter("", bot.user.displayAvatarURL);
        //embed.setFooter("______________________________");
        if (res.docs.length === 0) {
          embed.setDescription("As yet, the table for this server is empty.");
        } else if (res.docs.length < 10) {
          for (i = 0; i < res.docs.length; i++) {
           const User = await client.users.fetch(res.docs[i]._id);
            
            const name = User.tag || "User Not Found";

            if (name == "User Not Found") {
              embed.addField(
                `${i + 1}. ${name}`,
                `❯ This Week: ${m2h(res.docs[i].weekTime)} `
              );
            } else {
              embed.addField(
                `${i + 1}. ${name}`,
                `❯ This Week: ${m2h(res.docs[i].weekTime)}  `
              );
            }
          }
        } else {
          for (i = 0; i < 12; i++) {
            const User = await client.users.fetch(res.docs[i]._id);
            
            const name = User.tag || "User Not Found";

            if (name == "User Not Found") {
              embed.addField(
                `${pageNo + 1}. __***${name}***__\n\n`,
                `\n❯ This Week: **${m2h(res.docs[i].weekTime)}** `
              );
            } else {
              embed.addField(
                `${res.pagingCounter + i}. __***${name}***__\n\n`,
                `\n❯ This Week: **${m2h(res.docs[i].weekTime)}**  `
              );
            }
          }
        }
        msg.channel.send(embed);
      });
  }


});

/////////////////////////////////////////////////
//BOT LOGIN
////////////////////////////////////////////////

client.login(process.env.DISCORD_TOKEN);

////////////////////////////////////////////////
//CUSTOM FUNCTIONS
/////////////////////////////////////////////////

/**
 * @param {number} [limit] - Amount of maximum enteries to return.
 */

async function fetchLeaderboard(limit) {
  //if (!guildId) throw new TypeError("A guild id was not provided.");
  //if (!limit) throw new TypeError("A limit was not provided.");

  var users = await userModel
    .find({})
    .sort([["totalTime", "descending"]])
    .exec();

  return users.slice(0, limit);
}

/**
 * @param {string} [userId] - Discord user id.
 */

async function fetchUser(userId) {
  if (!userId) throw new TypeError("An user id was not provided.");

  const user = await userModel.findOne({ _id: userId });
  if (!user) return false;

  return user;
}

/**
 * @param {string} [guildId] - Discord Guild id.
 * @param {boolean} [bool] -isLean - Boolean.
 */

async function fetchConfig(guildId, isLean) {
  if (!guildId) throw new TypeError("An Guild id was not provided.");
  if(isLean){
    const config= await configModel.findOne({ _id: guildID }).lean();
  if (!config) return false;
  return config;
  }else{
    const config= await configModel.findOne({ _id: guildID });
    if (!config) return false;
    return config;
  }
}


/**
 * @param {object} [config] - db config model
 */

//refresh time in DB for calculating time on restart
const refreshTimeDB = (configDBTime) => {
  setInterval(async function () {
    let startTime = new Date();
    if (configDBTime) {
      configDBTime.refreshTime = startTime;
    } else {
      configDBTime = new configModel({
        _id: guildID,
        refreshTime: startTime,
      });
    }
    const result = await configDBTime.save();
    console.log(result);
  }, 10 * 1000); // 60 * 1000 milsec
};

/**
 * @param {string} [guildID] - Discord Guild id.
 */

//Where User is you mongoose user model
const CalculateTotalTime = async (guildID) => {
  let config = await configModel.findById(guildID);
  await userModel.find({}, async (err, users) => {
    if (err) console.log(err);
    //when bot restart time
    if (config) {
      let endTime = config.refreshTime;
      users.map(async (user) => {
        // if (user.startingTime === null) return;

        //if user was online before the bot started then count the hours and add
        if (user.OnVoice) {
          let startTime = user.startingTime;

          //calculate time
          if (endTime > user.startingTime) {
            let diff = endTime.valueOf() - startTime.valueOf();
            let diffInHours = diff / 1000 / 60 / 60 / 60;
            console.log(diffInHours);

            if (user.totalTime <= 0) user.totalTime = 0;
            //calculate the total time and save
            user.dayTime += timeDifference(endTime, startTime);
            user.weekTime += timeDifference(endTime, startTime);
            user.monthlyTime += timeDifference(endTime, startTime);
            user.totalTime += timeDifference(endTime, startTime);
            user.lastSession = timeDifference(endTime, startTime);
            //make the user offline
            user.OnVoice = false;
            //user.startingTime = new Date();
            const result = await user.save();
            console.log(result + "inside");
          }
        }
      });
    } else {
      console.log(err);
    }
  });
};

const resetDay = async (guildID) => {
  let config = await configModel.findById(guildID);
  await userModel.find({}, async (err, users) => {
    if (err) console.log(err);
    //when bot restart time
    if (config) {
      let endTime = config.refreshTime;
      users.map(async (user) => {
        // if (user.startingTime === null) return;

        //if user was online before the bot started then count the hours and add
        if (user.OnVoice) {
          let startTime = user.startingTime;

          //calculate time
          if (endTime > user.startingTime) {
            let diff = endTime.valueOf() - startTime.valueOf();
            let diffInHours = diff / 1000 / 60 / 60 / 60;
            console.log(diffInHours);

            if (user.totalTime <= 0) user.totalTime = 0;
            //calculate the total time and save
            user.dayTime = 0;
            user.weekTime += timeDifference(endTime, startTime);
            user.monthlyTime += timeDifference(endTime, startTime);
            user.totalTime += timeDifference(endTime, startTime);

            //make the user offline
            user.OnVoice = false;
            //user.startingTime = new Date();
            const result = await user.save();
            console.log(result + "inside");
          }
        }
      });
    } else {
      console.log(err);
    }
  });
};

const onlineOnReset = (guildID) => {
  //get the users in voice channel
  let guild = client.guilds.cache.get(guildID);

  guild.voiceStates.cache.forEach(async (item) => {
    console.log(item.id);

    let startTime = new Date();
    //find in database users and match
    let user = await userModel.findById(item.id);
    if (user) {
      user.startingTime = startTime;
      user.OnVoice = true;
    } else {
      user = new userModel({
        _id: item.id,
        userName: item.member.username,
        startingTime: startTime,
        totalTime: 0,
        //connected on voice
        OnVoice: true,
      });
    }
    const result = await user.save();
    console.log(result);
  });
};

// function m2h(minutes) {
//   let total = minutes;
//   let hrs = Math.floor(total / 60);
//   let min = total % 60;
//   return hrs + "`hr`" + min + "`min` ";
// }

// function m2h(sec) {
//   const diff = moment
//     .unix(sec)
//     .utc()
//     .format("D [days,] H [hours,] m [minutes ]");
//   //.format("H [hours,] m [minutes and] s [seconds]");

//   return diff;
// }

function m2h(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " `hr,`" : "`h`: ") : " 0 `h,` ";
  var mDisplay = m > 0 ? m + (m == 1 ? " `m,`" : "`m`: ") : " 0 `m,` ";
  var sDisplay = s > 0 ? s + (s == 1 ? " `sec`" : "`s` ") : " 0 `s,` ";
  return hDisplay + mDisplay + sDisplay;
}

//on start update the users start time and status on db
async function updateUserState(UserInfo) {
  let startTime = new Date();
  const user = await userModel.findById(UserInfo.id);

  if (!user) {
    const newUser = new userModel({
      _id: UserInfo.id,
      userName: UserInfo.member.username,
      startingTime: startTime,
      totalTime: 0,
      //connected on voice
      OnVoice: true,
    });
    await newUser.save().catch((e) => console.log(`Failed to save new user.`));
    //stop the execution
    return console.log("new user saved");
  }

  //if user is in database
  user.startingTime = startTime;
  user.OnVoice = true;

  await user
    .save()
    .catch((e) => console.log(`Failed to update user state in DB ${e}`));
  return console.log("user updated saved");
}

//-----------------------------------------
//ON MESSAGE
//-----------------------------------------

async function CalculateTotalTimeOnInterval() {
  const endTime = new Date();
  await userModel.find({}, async (err, users) => {
    if (err) console.log(err);

    users.map(async (user) => {
      // if (user.startingTime === null) return;

      //if user was online before the bot started then count the hours and add
      if (user.OnVoice === true) {
        let startTime = user.startingTime;

        //calculate time
        if (endTime > user.startingTime) {
          let diff = endTime.valueOf() - startTime.valueOf();
          let diffInHours = diff / 1000 / 60 / 60 / 60;
          console.log(diffInHours);

          //calculate the total time and save
          user.dayTime += timeDifference(endTime, startTime);
          user.weekTime += timeDifference(endTime, startTime);
          user.monthlyTime += timeDifference(endTime, startTime);
          user.totalTime += timeDifference(endTime, startTime);
          user.startingTime = endTime;
          // user.xp += timeDifference(endTime, startTime) / 60;
          // user.level = Math.floor(0.1 * Math.sqrt(user.xp));
          // let hasLevelU = await addXp(
          //   user._id,
          //   timeDifference(endTime, startTime) / 60
          // );
          //make the user offline
          //user.OnVoice = false;
          //user.startingTime = new Date();
          const result = await user.save();
          // hasLevelUp(hasLevelU, user.xp._id, user.level);
          addXp(user.id,(timeDifference(endTime, startTime))/60)
        }
      }
    });
  });
  return console.log("update done");
}

//reset om message
async function resetOnMessage() {
  const endTime = new Date();
  await userModel.find({}, async (err, users) => {
    if (err) console.log(err);

    users.map(async (user) => {
      // if (user.startingTime === null) return;
      if (user.OnVoice === false) {
        //calculate the total time and save
        user.dayTime = 0;
        //user.weekTime += timeDifference(endTime, startTime);
        //user.monthlyTime += timeDifference(endTime, startTime);
        user.totalTime = 0;
        user.startingTime = endTime;
        //make the user offline
        //user.OnVoice = false;
        //user.startingTime = new Date();
        const result = await user.save();
        console.log(result + "inside");
      }
      //if user was online before the bot started then count the hours and add
      if (user.OnVoice === true) {
        let startTime = user.startingTime;

        //calculate time
        if (endTime > user.startingTime) {
          let diff = endTime.valueOf() - startTime.valueOf();
          let diffInHours = diff / 1000 / 60 / 60 / 60;
          console.log(diffInHours);

          //calculate the total time and save
          user.dayTime = 0;
          user.weekTime += timeDifference(endTime, startTime);
          user.monthlyTime += timeDifference(endTime, startTime);
          user.totalTime = 0;
          user.startingTime = endTime;

          //make the user offline
          //user.OnVoice = false;
          //user.startingTime = new Date();
          const result = await user.save();
          console.log(result + "inside");
        }
      }
    });
  });
  return console.log("update done");
}

//reset week
async function resetWeekOnMessage() {
  const endTime = new Date();
  await userModel.find({}, async (err, users) => {
    if (err) console.log(err);

    users.map(async (user) => {
      // if (user.startingTime === null) return;
      if (user.OnVoice === false) {
        user.weekTime = 0;
        user.startingTime = endTime;
        //make the user offline
        //user.OnVoice = false;
        //user.startingTime = new Date();
        const result = await user.save();
        console.log(result + "inside");
      }
      //if user was online before the bot started then count the hours and add
      if (user.OnVoice === true) {
        let startTime = user.startingTime;

        //calculate time
        if (endTime > user.startingTime) {
          let diff = endTime.valueOf() - startTime.valueOf();
          let diffInHours = diff / 1000 / 60 / 60 / 60;
          console.log(diffInHours);

          //calculate the total time and save

          user.weekTime = 0;
          user.monthlyTime += timeDifference(endTime, startTime);
          user.totalTime += timeDifference(endTime, startTime);

          user.startingTime = endTime;
          //make the user offline
          //user.OnVoice = false;
          //user.startingTime = new Date();
          const result = await user.save();
          console.log(result + "inside");
        }
      }
    });
  });
  return console.log("update done");
}


//reset week
async function resetMonthOnMessage() {
  const endTime = new Date();
  await userModel.find({}, async (err, users) => {
    if (err) console.log(err);

    users.map(async (user) => {
      // if (user.startingTime === null) return;
      if (user.OnVoice === false) {
        user.monthlyTime = 0;
        user.weekTime = 0;
        user.xp = 0;
        user.level = 0;
        user.role = "No Role";
        user.startingTime = endTime;
        //make the user offline
        //user.OnVoice = false;
        //user.startingTime = new Date();
        const result = await user.save();
        console.log(result + "inside");
      }
      //if user was online before the bot started then count the hours and add
      if (user.OnVoice === true) {
        let startTime = user.startingTime;

        //calculate time
        if (endTime > user.startingTime) {
          let diff = endTime.valueOf() - startTime.valueOf();
          let diffInHours = diff / 1000 / 60 / 60 / 60;
          console.log(diffInHours);

          //calculate the total time and save

          user.weekTime = 0;
          user.monthlyTime = 0 ;
          user.xp = 0;
          user.level = 0;
          user.totalTime += timeDifference(endTime, startTime);
          user.role = "No Role";
          user.startingTime = endTime;
          //make the user offline
          //user.OnVoice = false;
          //user.startingTime = new Date();
          const result = await user.save();
          console.log(result + "inside");
        }
      }
    });
  });
  return console.log("update done");
}


 
function timeDifference(date1, date2) {
  if (!date1) throw new TypeError("date1 must be specified.");
  if (!date2) throw new TypeError("date2 must be specified.");

  var difference = date1 - date2;

  var secDifference = Math.floor(difference / 1000);

  console.log("difference = " + secDifference);

  return secDifference;
}

//*LEVEL SYSTEM ***************/

// async function addXp(userId, xp) {
//   if (!userId) throw new TypeError("A member id must be specified.");
//   if (!xp) throw new TypeError("An amount of xp must be specified.");
//   if (xp < 1)
//     throw new TypeError("The given xp amount cannot be lower than 1.");
//   if (isNaN(xp)) throw new TypeError("The given xp amount must be a number.");

//   let user = await userModel.findOne({ _id: userId });

//   user.xp += xp;
//   user.level = Math.floor(0.1 * Math.sqrt(user.xp));

//   await user
//     .save()
//     .catch((e) => console.log(`An error occured while saving the user : ${e}`));

//   return Math.floor(0.1 * Math.sqrt((user.xp -= xp))) < user.level;
// }



async function addXp(userId, xp) {
  if (!userId) throw new TypeError("A member id must be specified.");
  if (!xp) throw new TypeError("An amount of xp must be specified.");
  if (xp < 1)
    throw new TypeError("The given xp amount cannot be lower than 1.");
  if (isNaN(xp)) throw new TypeError("The given xp amount must be a number.");

  let user = await userModel.findOne({ _id: userId });
  const oldRole = user.role

  user.xp = (user.monthlyTime/60);
  user.level = Math.floor(0.1 * Math.sqrt(user.xp));

  await user
    .save()
    .catch((e) => console.log(`An error occured while saving the user : ${e}`));

  let hasLevelUp = Math.floor(0.1 * Math.sqrt((user.xp -= xp))) < user.level;

  // if (hasLevelUp) {
  //   if(RoleXp(user.level)){
  //     console.log(oldRole + "oldRole Variable inside of RoleXp(user.level)")
  //     console.log(user.role + "oldRole from DB inside of RoleXp(user.level)")
  //     console.log(RoleXp(user.level) + "NEW ROLE from DB inside of RoleXp(user.level)")
  //     if(RoleXp(user.level) != oldRole){
  //       console.log(oldRole + "oldRole Variable inside of RoleXp(user.level) != oldRole)")
  //     console.log(user.role + "oldRole from DB inside of RoleXp(user.level) != oldRole)")
  //     addRemoveRole(user._id,user.role,RoleXp(user.level))
  //     roleUpgradeMessage(user._id,user.role,RoleXp(user.level))
  //     user.role = RoleXp(user.level)
  //     await user.save().catch((e) => console.log(`An error occured while saving the user : ${e}`));
  //     }
  //   }
     
  //   // fetch the member
  //   // return false if there is no entry for the member
    
  // }

    if(RoleXp(user.level)){
      //if user role now has same role as the  role in db but not assigned then assign it
      if(RoleXp(user.level) != oldRole){
        console.log(oldRole + "oldRole Variable inside of RoleXp(user.level) != oldRole)")
      console.log(user.role + "oldRole from DB inside of RoleXp(user.level) != oldRole)")
      addRemoveRole(user._id,user.role,RoleXp(user.level))
      roleUpgradeMessage(user._id,RoleXp(user.level))
      user.role = RoleXp(user.level)
      await user.save().catch((e) => console.log(`An error occured while saving the user : ${e}`));
      }

      if(RoleXp(user.level) == oldRole){
        checkRole(user._id,RoleXp(user.level))
      console.log(oldRole + "oldRole Variable inside of RoleXp(user.level)")
      console.log(user.role + "oldRole from DB inside of RoleXp(user.level)")
      console.log(RoleXp(user.level) + "NEW ROLE from DB inside of RoleXp(user.level)")
      }
      
    }
     
    // fetch the member
    // return false if there is no entry for the member
    
  


}



// async function hasLevelUp(hasLevelUp, UserID, userLevel) {
//   if (hasLevelUp) {
//     // fetch the member
//     // return false if there is no entry for the member
//     const channel = client.channels.cache.get("761929698263302154");
//     channel.send(
//       `${
//         client.users.cache.get(UserID).tag
//       }, congratulations! You have reached the level **${userLevel}**. :tada:`
//     );
//   }
// }

/*
 * @param {number} [targetLevel] - Xp required to reach that level.
 */
function xpFor(targetLevel) {
  if (isNaN(targetLevel) || isNaN(parseInt(targetLevel, 10)))
    throw new TypeError("Target level should be a valid number.");
  if (isNaN(targetLevel)) targetLevel = parseInt(targetLevel, 10);
  if (targetLevel < 1)
    throw new RangeError("Target level should be a positive number.");
  return targetLevel * targetLevel * 100;
}


/**
 * @param {number} [level] -  user level.
*/
function RoleXp(level){
  if(level >=2 && level < 4){
    return "slcAlpha 1(2-4)"
  }else if(level >=4 && level < 7 ){
    return "slcAlpha 2(4-7)"
  }else if(level >=7 && level < 10 ){
    return "slcAlpha3(7-10)"
  }
  // }
  // if(level >=10 && level < 13 ){
  //   return "705424854505095180"
  // }
  // if(level >= 13 && level < 16){
  //   return "Star"
  // }
  // if(level > 13 && level <= 16){
  //   return "Proficient"
  // }

}


/**
 * @param {string} [userID] -  Discord User Id.
 * @param {string} [oldRole] - old role id .
 * @param {string} [newRole] - new role id.
*/
function roleUpgradeMessage(userId,newRole) {
  const guild = client.guilds.cache.get(guildID);
  const channel = client.channels.cache.get("761929698263302154");
  const role = guild.roles.cache.find(role => role.name === newRole );

  let embed = new Discord.MessageEmbed().setColor(embedColor.embedColor);
    embed.setTitle(client.users.cache.get(userId).tag);
    embed.setThumbnail(client.users.cache.get(userId).displayAvatarURL());
    embed.setImage("https://i.imgur.com/Q0pP3Td.png");
    embed.addFields(
      {
        name: `\u200b`,
        value: "<@" + client.users.cache.get(userId) + ">" + `, congratulations! for the new role **${role}** :tada:`,
        inline: true,
      }
    );
    embed.setFooter(
      "__© Study Livestream Crew__",
      client.user.displayAvatarURL()
    );

    channel.send(/*`${client.users.cache.get(userId)}`,*/embed);

  // channel.send(
  //   "<@" + client.users.cache.get(userId).tag + ">" + `, congratulations! for the new Role **${role.name}** :tada:`
  // );
}

// //by id
// /**
//  * @param {string} [userID] -  Discord User Id.
//  * @param {string} [oldRole] - old role id .
//  * @param {string} [newRole] - new role id.
// */
// function addRemoveRole(userID,oldRole, newRole ) {
//     const guild = client.guilds.cache.get(guildID);
//    const member = guild.members.cache.get(userID);
//    //const  member = guild.members.fetch(userID);
//    member.roles.add(newRole).catch(console.error);
//    member.roles.remove(oldRole).catch(console.error);
//    return console.log("Role added & removed");
//  }
 


 /**
 * @param {string} [userID] -  Discord User Id.
 * @param {string} [oldRole] - old role id .
 * @param {string} [newRole] - new role id.
*/
function addRemoveRole(userID,oldRole, newRole ) {
 const guild = client.guilds.cache.get(guildID);
 const member = guild.members.cache.get(userID);
 const nRole = guild.roles.cache.find(r => r.name === newRole);
 const oRole = guild.roles.cache.find(r => r.name === oldRole);
 //const  member = guild.members.fetch(userID);
 member.roles.add(nRole).catch(console.error);
 setTimeout(() => {
  member.roles.remove(oRole).catch(console.error);
}, 3000);
 return console.log("Role added & removed");
}


//by id
// /**
//  * @param {string} [userID] -  Discord User Id.
//  * @param {string} [oldRole] - old role id .
//  * @param {string} [newRole] - new role id.
// */
// function checkRole(userID, oldRole,newRole ) {
//   const guild = client.guilds.cache.get(guildID);
//   const member = guild.members.cache.get(userID);
//   if(!member.roles.cache.has(oldRole)){
//     member.roles.add(newRole).catch(console.error);
//     roleUpgradeMessage(userID,oldRole,newRole)
//   }

// }

//by name
/**
 * @param {string} [userID] -  Discord User Id.
 * @param {string} [oldRole] - old role id .
 * @param {string} [newRole] - new role id.
*/
function checkRole(userID, newRole ) {
  const guild = client.guilds.cache.get(guildID);
  const member = guild.members.cache.get(userID);
  const nRole = guild.roles.cache.find(r => r.name === newRole);
  const oRole = guild.roles.cache.find(r => r.name === oldRole);
  if(!member.roles.cache.has(nRole.id)){
    member.roles.add(nRole).catch(console.error);
    //roleUpgradeMessage(userID,newRole)
  }

}


//comment working fine