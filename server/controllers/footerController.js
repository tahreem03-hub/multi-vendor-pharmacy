import Footer from '../models/Footer.js';

export const getFooter = async (req, res) => {
  try {
    const settings = await Footer.findOne() || {};
    res.json(settings);
  } catch (err) { 
    res.status(500).json({ message: "Server error" }); 
  }
};

export const updateFooter = async (req, res) => {
  try {
    const logo = req.file ? `/uploads/${req.file.filename}` : req.body.logo;
    
    // Helper to safely parse JSON strings from FormData
    const safeParse = (data, fallback) => {
      try {
        return data ? JSON.parse(data) : fallback;
      } catch (e) {
        return fallback;
      }
    };

    const updateData = {
      logo,
      awardInfo: safeParse(req.body.awardInfo, {}),
      links: safeParse(req.body.links, []),
      addresses: safeParse(req.body.addresses, []),
      regulatoryText: req.body.regulatoryText || "",
      socialLinks: safeParse(req.body.socialLinks, []),
      certifications: safeParse(req.body.certifications, [])
    };
    
    const updatedData = await Footer.findOneAndUpdate({}, updateData, { 
      new: true, 
      upsert: true 
    });
    
    res.json(updatedData);
  } catch (err) { 
    console.error("Update Error:", err);
    res.status(400).json({ message: "Failed to update", error: err.message }); 
  }
};

export const deleteFooter = async (req, res) => {
  try {
    await Footer.deleteMany({});
    res.json({ message: "Footer configuration cleared successfully" });
  } catch (err) { 
    res.status(500).json({ message: "Failed to clear footer", error: err.message }); 
  }
};