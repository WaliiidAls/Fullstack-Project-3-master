// في هذا الملف ، قم بإعداد وحدة المستخدم (الطالب) الخاصة بك | in this file, set up your user module

// 1. قم باستيراد مكتبة moongoose | import the mongoose library
const Mongoose = require("mongoose");
// 2. قم بتحديد مخطط الطالب | start defining your user schema

const StudentSchema = new Mongoose.Schema({
  name: String,
  birthdate: String,
  city: String,
  email: { type: String, unique: true },
  by: String,
});
// 3. إنشاء نموذج الطالب | create  the user model
const StudentModel = Mongoose.model("students", StudentSchema);
// 4. تصدير الوحدة | export the module
module.exports = StudentModel;
