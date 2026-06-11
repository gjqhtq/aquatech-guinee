const PRODUCT_IMAGES = {
  'Thiof (Mérou blanc)':   '/images/thiof-merou-blanc.png',
  'Vivaneau rouge':        '/images/vivaneau-rouge.png',
  'Bar commun':            '/images/bar-commun.png',
  'Dorade royale':         '/images/dorade-royale.png',
  'Capitaine (Carangue)':  '/images/capitaine-carangue.png',
  'Sole':                  '/images/sole.png',
  'Thon albacore':         '/images/thon-albacore.png',
  'Thon listao':           '/images/thon-listao.png',
  'Bonite à dos rayé':     '/images/bonite-dos-raye.png',
  'Espadon':               '/images/espadon.png',
  'Sardines fraîches':     '/images/sardines-fraiches.png',
  'Hareng':                '/images/hareng.png',
  'Maquereau':             '/images/maquereau.png',
  'Anchois':               '/images/anchois.png',
  'Crevettes royales':     '/images/crevettes-royales.png',
  'Crevettes grises':      '/images/crevettes-grises.png',
  'Homard':                '/images/homard.png',
  'Crabe de mer':          '/images/crabe-de-mer.png',
  'Langouste':             '/images/langouste.png',
  'Poulpe':                '/images/poulpe.png',
  'Poulpe séché':          '/images/poulpe-seche.png',
  'Calmars':               '/images/calmars.png',
  'Huîtres de palétuvier': '/images/huitres-paletuvier.png',
  'Rouget barbet':         '/images/rouget-barbet.png',
  'Pageot':                '/images/pageot.png',
  'Mulet':                 '/images/mulet.png',
  'Carpe de mer':          '/images/carpe-de-mer.png',
  'Thiof séché':           '/images/thiof-seche.png',
  'Capitaine fumé':        '/images/capitaine-fume.png',
  'Sardines séchées':      '/images/sardines-sechees.png',
  'Thon albacore congelé': '/images/thon-albacore-congele.png',
  'Crevettes congelées':   '/images/crevettes-congelees.png',
};

export const getProductImage = (typePoisson) =>
  PRODUCT_IMAGES[typePoisson] || '/images/poisson_generique.svg';

export default PRODUCT_IMAGES;
