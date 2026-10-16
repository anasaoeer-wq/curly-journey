/**
 * config.js — جميع الثوابت القابلة للضبط في مكان واحد.
 */
export const CONFIG = {
  // أبعاد الكرة
  GLOBE_RADIUS: 5,
  GLOBE_SEGMENTS: 96,

  // مسافات الكاميرا
  CAMERA_MIN_DISTANCE: 6.5,
  CAMERA_MAX_DISTANCE: 30,
  CAMERA_INITIAL_POS: { x: 0, y: 3, z: 14 },

  // مصادر الخرائط النسيجية (CDN عام)
  TEXTURES: {
    day: 'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
    bump: 'https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png',
    specular: 'https://unpkg.com/three-globe@2.31.0/example/img/earth-water.png',
    clouds: 'https://unpkg.com/three-globe@2.31.0/example/img/clouds.png',
  },

  // مصدر GeoJSON (Natural Earth 110m — تصنيفات الأمم المتحدة)
  GEOJSON_URL:
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',

  // إزاحة الحدود عن السطح لتجنّب z-fighting
  BORDER_OFFSET: 1.004,
  HIGHLIGHT_OFFSET: 1.009,

  // الألوان
  COLORS: {
    background: 0x000308,
    borderDefault: 0x2a5a8a,
    borderLand: 0x00ff9d,
    borderMaritime: 0x3da9ff,
    borderWater: 0x00d4ff,
    hover: 0xffee88,
  },

  // تحكم
  ROTATE_SPEED: 0.45,
  DAMPING: 0.06,
  AUTO_ROTATE_SPEED: 0.25,
};