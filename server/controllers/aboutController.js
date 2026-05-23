import About from '../models/About.js';

export const getAboutData = async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      // Provide fallback placeholder text to bypass the 'required: true' schema validations
      about = await About.create({
        aboutUs: { 
          title: 'About Us',
          description: 'Please add your company details.' 
        },
        ourVision: { 
          title: 'Our Vision',
          description: 'Please add your strategic vision description.' 
        },
        ourServices: { 
          title: 'Our Services',
          description: 'Please add a services summary.',
          servicesList: [] 
        },
        whyChooseUs: { 
          title: 'Why Choose Us',
          points: [] 
        },
        ourTeam: { 
          title: 'Our Team',
          members: [] 
        },
        ourCommitment: { 
          title: 'Our Commitment',
          description: 'Please add your client commitment values.' 
        }
      });
    }
    return res.status(200).json(about);
  } catch (err) {
    console.error("Error getting about data:", err);
    return res.status(500).json({ message: "Server error retrieving record." });
  }
};

export const updateAboutData = async (req, res) => {
  try {
    const { aboutUs, ourVision, ourServices, whyChooseUs, ourTeam, ourCommitment } = req.body;

    const updatedAbout = await About.findOneAndUpdate(
      {},
      { $set: { aboutUs, ourVision, ourServices, whyChooseUs, ourTeam, ourCommitment } },
      { new: true, upsert: true, runValidators: true } // Mongoose will throw here if required fields are empty
    );

    return res.status(200).json({ message: "Updated successfully!", data: updatedAbout });
  } catch (err) {
    // Check for Mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation Error: Missing required fields.", details: err.message });
    }
    console.error("Error updating about data:", err);
    return res.status(500).json({ message: "Server error updating records." });
  }
};

export const deleteAboutRecord = async (req, res) => {
  try {
    await About.deleteMany({});
    return res.status(200).json({ message: "About pages content cleared." });
  } catch (err) {
    return res.status(500).json({ message: "Failed to purge record." });
  }
};