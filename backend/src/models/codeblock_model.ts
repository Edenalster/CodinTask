import mongoose from "mongoose";

export interface ICodeBlock extends mongoose.Document {
  name: string;
  initialCode: string;
  solution: string;
}

const CodeBlockSchema = new mongoose.Schema<ICodeBlock>({
  name: {
    type: String,
    required: true,
  },
  initialCode: {
    type: String,
    required: true,
  },
  solution: {
    type: String,
    required: true,
  },
});

export default mongoose.model<ICodeBlock>("CodeBlock", CodeBlockSchema);
