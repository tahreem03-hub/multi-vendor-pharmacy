import Slider from "../models/Slider.js";

export const getSliders = async(res,req,next) =>{
    try {
        const slides = await slider.find().sort({ createdAt: -1})
    } catch (error) {
        next(error)
        
    }
};
export const createSlider = async (req, res, next) => {
  try {
    const { title, description, imageUrl, buttonText, buttonLink } = req.body;

    const newSlide = await Slider.create({
      title,
      description,
      imageUrl,
      buttonText,
      buttonLink
    });

    res.status(201).json({ message: "Slide added successfully!", slide: newSlide });
  } catch (err) {
    next(err);
  }
};

export const deleteSlider = async (req, res, next) => {
  try {
    const slide = await Slider.findByIdAndDelete(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: "Slide not found" });
    }
    res.status(200).json({ message: "Slide deleted successfully" });
  } catch (err) {
    next(err);
  }
};