// في هذا الملف ، قم بإعداد وحدة المستخدم (المدرس) الخاصة بك | in this file, set up your user module

// 1. قم باستيراد مكتبة moongoose | import the mongoose library
const ShortID = require("shortid");
const Mongoose = require("mongoose");
const HashPassword = require("../helper");
// 2. قم بتحديد مخطط المدرس | start defining your user schema
const TeacherSchema = new Mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  birthday: String,
  password: String,
  city: String,
  gender: String,
  salt: String,
});
// تخزين كلمة السر بعد عمل الهاش
TeacherSchema.pre("save", function (next) {
  if (!this.salt) {
    this.salt = ShortID.generate();
  }
  if (this.password) {
    this.password = HashPassword(this.password, this.salt);
  }
  next();
});
// 3. إنشاء نموذج المدرس | create  the user model
const TeacherModel = Mongoose.model("teachers", TeacherSchema);
// 4. تصدير الوحدة | export the module
module.exports = TeacherModel;
