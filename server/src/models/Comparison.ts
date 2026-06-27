import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComparison extends Document {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  aiSummary: string;
  scores: Record<string, any>;
  createdAt: Date;
}

const ComparisonSchema = new Schema<IComparison>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    ],
    aiSummary: {
      type: String,
      default: '',
    },
    scores: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

ComparisonSchema.index({ user: 1 });
ComparisonSchema.index({ products: 1 });

const Comparison: Model<IComparison> = mongoose.model<IComparison>('Comparison', ComparisonSchema);
export default Comparison;
