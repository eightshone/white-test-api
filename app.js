const express = require("express");
const userRouter = require("./routers/user");
const classroomRouter = require("./routers/classroom");
const whiteTestRouter = require("./routers/whiteTest");
const port = process.env.PORT;
require("./db/db")();

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(classroomRouter);
app.use(whiteTestRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
