const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
require("dotenv").config();

// app
const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(morgan("dev"));

const corsOptions = {
	origin: "*",
	credentials: true,
};

app.use(cors(corsOptions));

//cors
// if (process.env.NODE_ENV === "development") {
//     app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
//   }

// const options = {
//     origin: ['http://localhost:3000', 'http://ec2-65-0-110-57.ap-south-1.compute.amazonaws.com'],
//     credentials: true
// }
// app.use(cors(options))

//cors
//if (process.env.NODE_ENV === "development") {
//    app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
//  }

// bring routes
const authRoute = require("./routes/auth");
const { authJWT } = require("./controller/auth");

// db connection
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("DB Connected"));

mongoose.connection.on("error", (err) => {
	console.log(`DB connection error: ${err.message}`);
});

// use routes
app.use("/api", authRoute);

// server listen
app.listen(9000 || process.env.PORT, () => {
	console.log(`Server running at port ${process.env.PORT}`);
});
