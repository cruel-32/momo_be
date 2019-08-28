import mongoose from './serve/mongoose';
import app from './serve/app';
import { ErrorHandler } from 'lib/errorHandler'

mongoose.connect(process.env.MONGO_URI || "");

app.listen(process.env.PORT || 8000, () => {
  console.info(`momo application launched at http://localhost:${process.env.PORT || 8000}`);
});

app.on('error', new ErrorHandler().log );