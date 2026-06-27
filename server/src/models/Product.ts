import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  brand: string;
  category: string;
  processor: string;
  gpu: string;
  ram: string;
  storage: string;
  display: string;
  battery: string;
  weight: string;
  price: number;
  os: string;
  images: string[];
  benchmarkScore: number;
  rating: number;
  reviewCount: number;
  specs: Record<string, any>;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'laptop',
      trim: true,
    },
    processor: {
      type: String,
      trim: true,
      default: '',
    },
    gpu: {
      type: String,
      trim: true,
      default: '',
    },
    ram: {
      type: String,
      trim: true,
      default: '',
    },
    storage: {
      type: String,
      trim: true,
      default: '',
    },
    display: {
      type: String,
      trim: true,
      default: '',
    },
    battery: {
      type: String,
      trim: true,
      default: '',
    },
    weight: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    os: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    benchmarkScore: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    specs: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
ProductSchema.index({ name: 'text', brand: 'text' });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ category: 1 });

const Product: Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
