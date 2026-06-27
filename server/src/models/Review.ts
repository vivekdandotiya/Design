import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  pros: string;
  cons: string;
  opinion: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    pros: {
      type: String,
      trim: true,
      default: '',
    },
    cons: {
      type: String,
      trim: true,
      default: '',
    },
    opinion: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });
ReviewSchema.index({ product: 1 });

const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
