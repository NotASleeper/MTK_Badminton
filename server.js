const express = require("express");
const path = require("path");
const { sequelize } = require("./models");
const { rootRouter } = require("./routers");
const app = express();
const cors = require("cors");

// Kích hoạt lắng nghe sự kiện
require("./listeners/order.listener");

app.use(cors());

// cài ứng dụng sử dụng kiểu json
app.use(express.json());

// cài đặt static file
const publicPathDirectory = path.join(__dirname, "./public");
app.use(express.static(publicPathDirectory));

// cài đặt router
app.use("/api/v1", rootRouter);

// lắng nghe sự kiện kết nối
app.listen(3000, async () => {
    console.log("App listening on http://localhost:3000");
    try {
        await sequelize.authenticate();
        console.log("Kết nối thành công đến cơ sở dữ liệu MySQL.");
    } catch (error) {
        console.error("Không thể kết nối đến cơ sở dữ liệu MySQL:", error);
    }
});
