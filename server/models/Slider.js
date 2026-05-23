import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true 
    },
    imageUrl: { 
      type: String, 
      required: true 
    },
    buttonText: { 
      type: String, 
      default: "Learn More" 
    },
    buttonLink: { 
      type: String, 
      default: "/" 
    }
  }, // 💡 This closing brace finishes the fields object!
  { 
    timestamps: true // 💡 This is the separate options object
  }
);

const Slider = mongoose.models.Slider || mongoose.model("Slider", sliderSchema);
export default Slider;