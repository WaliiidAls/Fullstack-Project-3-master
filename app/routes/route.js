// في هذا الملف ، قم بإعداد طرق التطبيق الخاصة بك | in this file, set up your application routes
const Joi = require("@hapi/joi");
const TeacherModel = require("../models/Teacher");
const StudentModel = require("../models/Student");
const HashPassword = require("../helper");
const jwt = require("jsonwebtoken");
// 1. استيراد وحدةالمدرس | import the teacher module
// 2. استيراد وحدة الطالب | import the student module
// 3. تسجيل مدرس جديد و تخزين بياناته | new teacher sign up
const NewTeacher = async (name, email, city, password, birthday, gender) => {
  const Teacher = new TeacherModel({
    name,
    email,
    birthday,
    password,
    city,
    gender,
  });
  await Teacher.save();
  return Teacher;
};
const NewStudent = async (name, birthdate, city, email, teacher) => {
  const Student = new StudentModel({
    name,
    birthdate,
    city,
    email,
    by: teacher,
  });
  await Student.save();
  return Student;
};
// 4. تسجيل دخول مدرس و ارجاع التوكن | teacher login and response with jwt token

// 5. إعداد طرق مختلفة | setup the different routes (get, post, put, delete)
const SetUpApp = (app) => {
  // Teacher Stuff
  app.post("/Teacher/register", async (req, res) => {
    const { name, email, city, birthday, password, gender } = req.body;
    const bodySchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      city: Joi.string().required(),
      birthday: Joi.string().required(),
      password: Joi.string().min(6).required(),
      gender: Joi.string().required(),
    });
    const validation = bodySchema.validate(req.body);
    if (validation.error) {
      res.statusCode = 401;
      res.send(validation.error.details[0].message);
      return;
    }
    try {
      const Teacher = await NewTeacher(
        name,
        email,
        city,
        password,
        birthday,
        gender
      ).catch((err) => {
        if (err.code === 11000) {
          res.statusCode = 401;
          res.send(`email: ${email} is already registered`);
          return;
        }
        console.log(err);
      });
      res.send(`${Teacher}, \n\n login to get your token`);
    } catch (error) {
      res.statusCode = 401;
      res.send(error);
    }
  });
  app.post("/Teacher/login", async (req, res) => {
    const { email, password } = req.body;
    const bodySchema = Joi.object({
      name: Joi.string(),
      email: Joi.string().email().required(),
      city: Joi.string(),
      birthday: Joi.string(),
      password: Joi.string().min(6).required(),
      gender: Joi.string(),
    });
    const validation = bodySchema.validate(req.body);
    if (validation.error) {
      res.statusCode = 401;
      res.send(validation.error.details[0].message);
    }
    const teacher = await TeacherModel.findOne({ email });
    if (!teacher) {
      res.statusCode = 401;
      res.send("email not found");
    } else {
      if (teacher.password === HashPassword(password, teacher.salt)) {
        const token = jwt.sign({ sub: teacher._id }, teacher.salt, {
          expiresIn: 60,
        });
        res.send(
          `welcome back ${teacher.gender === "Male" || "male" ? "mr" : "mrs"}.${
            teacher.name
          } \n token: ${token}`
        );
      } else {
        res.statusCode = 401;
        res.send("wrong password");
      }
    }
  });
  app.post("/Teacher/create", async (req, res) => {
    const token = req.headers.authorization;
    const { name, birthdate, city, email } = req.body;
    if (!token) {
      res.statusCode = 401;
      res.send("Teacher not found");
      return;
    }
    const bodySchema = Joi.object({
      name: Joi.string().required(),
      birthdate: Joi.string().required(),
      city: Joi.string().required(),
      email: Joi.string().email().required(),
    });
    const validation = bodySchema.validate(req.body);
    if (validation.error) {
      res.statusCode = 401;
      res.send(validation.error.details[0].message);
      return;
    }
    const decodedToken = jwt.decode(token);
    if (!decodedToken) {
      res.statusCode = 401;
      res.send("Teacher not found");
      return;
    }
    const Teacher = await TeacherModel.findById(decodedToken.sub);
    try {
      const Student = await NewStudent(
        name,
        birthdate,
        city,
        email,
        Teacher.name
      ).catch((err) => {
        if (err.code === 11000) {
          res.statusCode = 401;
          res.send(`email: ${email} is already registered`);
          return;
        }
        console.log(err);
      });
      res.send(`${Student.name} assigned \n by ${Student.by}`);
    } catch (error) {
      res.statusCode = 401;
      res.send(error);
    }
  });
  app.put("/Teacher/modify/:studentID", async (req, res) => {
    const { studentID } = req.params;
    const token = req.headers.authorization;
    if (!token) {
      res.statusCode = 401;
      res.send("Teacher not found");
      return;
    }
    const decodedToken = jwt.decode(token);
    if (!decodedToken) {
      res.statusCode = 401;
      res.send("Teacher not found");
      return;
    }
    const Teacher = await TeacherModel.findById(decodedToken.sub);
    if (!Teacher) {
      res.statusCode = 401;
      res.send("Teacher not found");
      return;
    }
    const student = await StudentModel.findById(studentID);
    if (!student) {
      res.statusCode = 401;
      res.send("studentID not found");
      return;
    }
    const body = req.body;
    if (body.name) {
      student.name = body.name;
    }
    if (body.birthdate) {
      student.birthdate = body.birthdate;
    }
    if (body.city) {
      student.city = body.city;
    }
    if (body.email) {
      student.email = body.email;
    }
    await student.save();
    res.send("changes added");
  });
  app.delete("/Teacher/delete/:studentID", async (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
      res.statusCode = 401;
      res.send("you don't have access");
      return;
    }
    const student = await StudentModel.findById(req.params.studentID);
    if (!student) {
      res.statusCode = 401;
      res.send("studentID not found");
      return;
    }
    await student.deleteOne();
    res.send(`${student.name} is deleted`);
  });
  // students
  app.get("/Students", async (req, res) => {
    if (req.query.city) {
      res.send(await StudentModel.find({ city: req.query.city }));
    } else {
      res.send(await StudentModel.find({}));
    }
  });
  app.get("/Students/:studentID", async (req, res) => {
    const bodySchema = Joi.object({
      studentID: Joi.string().required(),
    });
    const validation = bodySchema.validate(req.params);
    if (validation.error) {
      res.statusCode = 400;
      res.send(validation.error.details[0].message);
      return;
    }
    const condition = {
      studentID: req.params.studentID,
    };
    const data = await StudentModel.findById(condition.studentID);
    res.send(data);
  });
  app.post("/Student/login", async (req, res) => {
    const { name, email } = req.body;
    const bodySchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      birthdate: Joi.string(),
      city: Joi.string(),
    });
    const validation = bodySchema.validate(req.body);
    if (validation.error) {
      res.statusCode = 401;
      res.send(validation.error.details[0].message);
    }
    const student = await StudentModel.findOne({ email });
    if (!student) {
      res.statusCode = 401;
      res.send("email not found");
    } else {
      if (student.name === name) {
        res.send(`welcome back ${student.name} \n no tasks #winning`);
      } else {
        res.statusCode = 401;
        res.send("wrong password");
      }
    }
  });
  app.get("*", (req, res) => {
    res.statusCode = 401;
    res.send("404 not page found");
  });
  app.post("*", (req, res) => {
    res.statusCode = 401;
    res.send("404 not page found");
  });
  app.delete("*", (req, res) => {
    res.statusCode = 401;
    res.send("404 not page found");
  });
  app.put("*", (req, res) => {
    res.statusCode = 401;
    res.send("404 not page found");
  });
};
// 3. تصدير الوحدة | export the module
module.exports = SetUpApp;
