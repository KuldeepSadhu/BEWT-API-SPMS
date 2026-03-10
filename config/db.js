import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

      console.log("DB_connected at ", process.env.MONGO_URI);
    })
    .catch((err) => console.log(err));
};
export default connectDB;
