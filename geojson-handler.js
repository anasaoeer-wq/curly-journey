/**
 * geojson-handler.js — تحميل GeoJSON وتحويل الإحداثيات ورسم الحدود
 * والكشف عن الدولة تحت المؤشر.
 */
import * as THREE from 'three';
import { CONFIG } from './config.js';

export class GeoJSONHandler {
  constructor(globeScene) {
    this.globe = globeScene;
    this.countries = [];
    this.loaded = false;
  }

  async load(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`فشل تحميل GeoJSON: HTTP ${res.status}`);
    const data = await res.json();
    this._parse(data);
    this.loaded = true;
    return this.countries;
  }

  _parse(geojson) {
    const features = geojson.features || [];
    this.countries = features.map((f) => {
      const p = f.properties || {};
      return {
        name: p.ADMIN || p.NAME || p.name || p.NAME_LONG || 'غير معروف',
        iso: p.ISO_A3 || p.ISO_A2 || p.iso_a3 || '',
        region: p.REGION_UN || p.REGION_WB || p.CONTINENT || '',
        subregion: p.SUBREGION || '',
        population: p.POP_EST ?? p.population ?? null,
        area: p.AREA ?? p.area ?? null,
        geometry: f.geometry,
        properties: p,
      };
    });
  }

  /**
   * إحداثيات جغرافية → Vector3 في الفضاء المحلي للكرة.
   * مطابق لمعادلة three.js SphereGeometry.
   */
  latLonToVector3(lat, lon, radius) {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lon + 180) * Math.PI) / 180;
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  /**
   * رسم كل حدود الدول على الكرة (خطوط دقيقة).
   */
  drawAllBorders() {
    this.globe.clearBorders();
    const radius = CONFIG.GLOBE_RADIUS * CONFIG.BORDER_OFFSET;
    for (const c of this.countries) {
      if (!c.geometry) continue;
      this._drawGeometry(c.geometry, radius, CONFIG.COLORS.borderDefault, 0.55,
        (pts) => this.globe.addBorderLine(pts, CONFIG.COLORS.borderDefault, 0.55));
    }
  }

  /**
   * رسم حدود الدولة المميزة (بري/بحري/مائي) في مجموعة highlightGroup.
   */
  drawHighlightedBorders(country) {
    this.globe.clearHighlight();
    if (!country || !country.geometry) return;

    const radius = CONFIG.GLOBE_RADIUS * CONFIG.HIGHLIGHT_OFFSET;

    const drawRing = (ring, color) => {
      if (ring.length < 2) return;
      const pts = ring.map(([lon, lat]) =>
        this.latLonToVector3(lat, lon, radius)
      );
      // إغلاق الحلقة
      pts.push(pts[0].clone());
      this.globe.addHighlightLine(pts, color, 1.0);
    };

    const processPolygon = (rings) => {
      // الحلقة الخارجية = الحدود البرية
      drawRing(rings[0], CONFIG.COLORS.borderLand);
      // الحلقات الداخلية = بحيرات/مياه داخلية
      for (let i = 1; i < rings.length; i++) {
        drawRing(rings[i], CONFIG.COLORS.borderWater);
      }
    };

    const g = country.geometry;
    if (g.type === 'Polygon') {
      processPolygon(g.coordinates);
    } else if (g.type === 'MultiPolygon') {
      g.coordinates.forEach(processPolygon);
    }
  }

  _drawGeometry(geometry, radius, color, opacity, addFn) {
    const drawRing = (ring) => {
      if (ring.length < 2) return;
      const pts = ring.map(([lon, lat]) =>
        this.latLonToVector3(lat, lon, radius)
      );
      addFn(pts);
    };

    if (geometry.type === 'Polygon') {
      geometry.coordinates.forEach(drawRing);
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach((poly) => poly.forEach(drawRing));
    }
  }

  /**
   * كشف الدولة تحت (lat, lon) باستخدام Ray-Casting داخل المضلعات.
   */
  findCountryAt(lat, lon) {
    for (const c of this.countries) {
      if (!c.geometry) continue;
      if (this._pointInGeometry(lat, lon, c.geometry)) return c;
    }
    return null;
  }

  _pointInGeometry(lat, lon, geometry) {
    if (geometry.type === 'Polygon') {
      return this._pointInPolygon(lat, lon, geometry.coordinates);
    }
    if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.some((poly) =>
        this._pointInPolygon(lat, lon, poly)
      );
    }
    return false;
  }

  _pointInPolygon(lat, lon, rings) {
    // اختبار الحلقة الخارجية أولاً
    if (!this._ringContains(lat, lon, rings[0])) return false;
    // ثم نستبعد الثقوب
    for (let i = 1; i < rings.length; i++) {
      if (this._ringContains(lat, lon, rings[i])) return false;
    }
    return true;
  }

  _ringContains(lat, lon, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const intersect =
        yi > lat !== yj > lat &&
        lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  getByName(name) {
    return this.countries.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
  }
}