//  استيراد المكتبات المطلوبة | import the required libraries
//  تأكد من تنزيل الوحدات المطلوبة | make sure to download the required modules

const express = require("express");
const mongoose = require("mongoose");
const SetUpApp = require("./routes/route");
const bodyParser = require("body-parser");

mongoose
  .connect("mongodb://localhost/FS3", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    const app = express();
    app.use(bodyParser.urlencoded());

    SetUpApp(app);

    app.listen(4000);
  })
  .catch((err) => console.log(err));
// لا تنسى تحديد وظيفة الخادم | don't forget to define the server function that listens to requests
