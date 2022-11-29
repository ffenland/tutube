import "dotenv/config";
import "./db.js";
import "./models/Comment.js";
import "./models/Video.js";
import "./models/User.js";
import app from "./server.js";

// PORT for heroku
const PORT = process.env.PORT || 5432;
app.listen(PORT, () => {
  console.log(`✅ Server listenting on port http://localhost:${PORT} 🚀`);
});
