import express from "express";
import morgan from "morgan";

import "./db.js";

import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const PORT = 5432;
const app = express();

//Middlewares

app.set("view engine", "pug");
app.set("views", `${process.cwd()}/src/views`);
app.use(morgan("tiny"));
// express가 form의 데이터를 다루게 하기 위함.
app.use(express.urlencoded({ extended: true }));

app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

app.listen(PORT, () => {
  console.log(`✅ Server listenting on port http://localhost:${PORT} 🚀`);
});
