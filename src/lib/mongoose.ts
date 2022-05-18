import mongoose from "mongoose";

const mongooseClient = mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.jovfr.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
);

export default mongooseClient;
