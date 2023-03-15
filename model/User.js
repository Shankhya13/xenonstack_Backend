const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const Crypto = require("crypto")

const UserSchema = new mongoose.Schema(
  {
    username : {
      type:String,
      required : true
    },
    useremail: {
      type: String,
      required: true,
      unique: 32,
    },
    hashed_password: {
      type: String,
    },
    role : {
      type : Number,
      default : 1
    }
  },
  {
    timestamps: true,
  }
);

UserSchema.virtual("password")
  .set(function (password) {
    this._password = password;
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return Crypto
        .createHmac("sha1", "secret")
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", UserSchema);
