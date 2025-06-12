// Image assets for WerTigo application
// This file provides both public path references and import-based alternatives

// Public path references (current approach - works with public directory)
export const PUBLIC_IMAGES = {
  // Team member images
  LOGO: '/images/LOGO.png',
  GAB: '/images/GAB.jpg',
  ED: '/images/ED.jpg',
  MATT: '/images/MATT.jpg',
  NAV: '/images/NAV.png',
  PICNIC: '/images/PICNIC.jpg',
  SKY: '/images/SKY.jpg',
 
  // Destination images
  DESTINATIONS: {
    BOHOL: '/images/DESTINATIONS/Bohol.jpg',
    BORACAY: '/images/DESTINATIONS/Boracay.jpg',
    ELNIDO: '/images/DESTINATIONS/ELNIDO.jpg',
    KAYNIPA:'/images/DESTINATIONS/Caynipa.jpg',
    BALITE: '/images/DESTINATIONS/BALITE.jpg',
    SKYRANCH: '/images/DESTINATIONS/SKYRANCH.jpg'
  }
};

// Alternative: Import-based approach (for better optimization)
// Uncomment and use these if you want Vite to process and optimize the images
/*
import logoImg from '../../public/images/LOGO.png';
import gabImg from '../../public/images/GAB.jpg';
import edImg from '../../public/images/ED.jpg';
import mattImg from '../../public/images/MATT.jpg';
import navImg from '../../public/images/NAV.png';
import picnicImg from '../../public/images/PICNIC.jpg';
import skyImg from '../../public/images/SKY.jpg';
import boholImg from '../../public/images/DESTINATIONS/Bohol.jpg';
import boracayImg from '../../public/images/DESTINATIONS/Boracay.jpg';
import elnidoImg from '../../public/images/DESTINATIONS/ELNIDO.jpg';

export const IMPORTED_IMAGES = {
  LOGO: logoImg,
  GAB: gabImg,
  ED: edImg,
  MATT: mattImg,
  NAV: navImg,
  PICNIC: picnicImg,
  SKY: skyImg,
  DESTINATIONS: {
    BOHOL: boholImg,
    BORACAY: boracayImg,
    ELNIDO: elnidoImg
  }
};
*/

// Default export uses public paths (current working approach)
export default PUBLIC_IMAGES; 