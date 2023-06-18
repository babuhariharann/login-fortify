import mongoose from "mongoose";

const connection = async (URL) => {
  try {
    await mongoose.connect(`${URL}`, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.log("Error while connecting mongodb : ", err);
  }
};

export default connection;
