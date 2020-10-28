const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const UserSchema = new mongoose.Schema({
  _id: { type: String },
  userName: { type: String },
  startingTime: { type: Date },
  endTime: { type: Date },
  dayTime: { type: Number, default: 0 },
  weekTime: { type: Number, default: 0 },
  monthlyTime: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  role: {type: String, default: "NO ROLE" },
  OnVoice: { type: Boolean, default: false },
});

UserSchema.plugin(mongoosePaginate);

const User = mongoose.model("User", UserSchema);
module.exports = User;

/*
const UserSchema = new mongoose.Schema({
  _id: { type: String },
  userName: { type: String },
  startingTime: { type: Date },
  endTime: { type: Date },
  dayTime: { type: Number, default: 0 },
  weekTime: { type: Number, default: 0 },
  monthlyTime: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  onVoice: { type: Boolean, default: false },
});
*/
