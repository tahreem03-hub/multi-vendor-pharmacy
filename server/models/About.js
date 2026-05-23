import mongoose from 'mongoose';

const AboutSchema = new mongoose.Schema(
  {
 
    aboutUs: {
      title: { type: String, default: 'About Us' },
      description: { type: String,  },
    },

   
    ourVision: {
      title: { type: String, default: 'Our Vision' },
      description: { type: String, },
    },

    
    ourServices: {
      title: { type: String, default: 'Our Services' },
      description: { type: String }, 
      servicesList: [
        {
          title: { type: String,  },
          description: { type: String, },
          icon: { type: String }, 
        }
      ]
    },

   
    whyChooseUs: {
      title: { type: String, default: 'Why Choose Us' },
      description: { type: String },
      points: [
        {
          title: { type: String,},
          description: { type: String, }
        }
      ]
    },

   
    ourTeam: {
      title: { type: String, default: 'Our Team' },
      description: { type: String },
      members: [
        {
          name: { type: String,  },
          role: { type: String,  },
         
          bio: { type: String }
        }
      ]
    },

    ourCommitment: {
      title: { type: String, default: 'Our Commitment' },
      description: { type: String, required: true },
    }
  },
  { 
    timestamps: true 
  }
);


const About = mongoose.models.About || mongoose.model('About', AboutSchema);

export default About;