import "./db.js";
import "./models/Video";
import "./models/User";
import app from "./server";

const PORT = 5432;
app.listen(PORT, () => {
  console.log(`✅ Server listenting on port http://localhost:${PORT} 🚀`);
});
