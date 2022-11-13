import express, { json } from "express";
import morgan from "morgan";
import session from "express-session";

import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const app = express();
//Middlewares
app.set("view engine", "pug");
app.set("views", `${process.cwd()}/src/views`);
app.use(morgan("tiny"));
// express가 form의 데이터를 다루게 하기 위함.
app.use(express.urlencoded({ extended: true }));

//session
app.use(session({ secret: "hello", resave: true, saveUninitialized: true }));
app.use((req, res, next) => {
  req.sessionStore.all((error, sessions) => {
    console.log(sessions);
    next();
  });
});
app.get("/add-one", (req, res, next) => {
  return res.send(`${req.session.id}`);
});

app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
