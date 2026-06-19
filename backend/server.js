import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import config from "./src/config/config.js";

connectDB();

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});