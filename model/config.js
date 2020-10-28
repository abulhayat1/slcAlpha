const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  _id: String,
  serverName: String,
  refreshTime: Date,
  currentDate: Date,
  currentWeek: Date,
  currentMonth: Date,
  confirmCode : { type: Number, default: 963852 },
  roles :
    {
      "slcAlpha1" : {type: String, default: "1abc9c" },
      "slcAlpha2" : {type: String, default: "#2ecc71" },
      "slcAlpha3" : {type: String, default: "#3498db" }
    }
});

const config = mongoose.model("config", configSchema);
module.exports = config;
