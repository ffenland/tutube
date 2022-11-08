import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://ffenland:nomadstudy@nomadffen.zttasek.mongodb.net/tutube?retryWrites=true&w=majority"
);

const db = mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB");
const handleError = (error) => console.log("DB error", error);
db.on("error", handleError);
db.once("open", handleOpen);
