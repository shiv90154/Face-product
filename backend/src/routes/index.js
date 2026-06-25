// backend/src/routes/index.js
import authRouter from "./auth.route.js";
import productRouter from "./product.routes.js";
import uploadRouter from "./upload.routes.js";
import categoryRouter from "./category.route.js"; 

export { authRouter, productRouter, uploadRouter, categoryRouter };