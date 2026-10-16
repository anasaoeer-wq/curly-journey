/**
 * main.js — نقطة الدخول: ربط المشهد والمعالج وواجهة المستخدم.
 */
import { GlobeScene } from './globe-scene.js';
import { GeoJSONHandler } from './geojson-handler.js';
import { UIController } from './ui-controller.js';
import { CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('globe-container');
  const ui = new UIController();
  const globe = new GlobeScene(container);
  const geo = new GeoJSONHandler(globe);

  try {
    ui.setStatus('جارٍ تحميل بيانات الدول…');
    const countries = await geo.load(CONFIG.GEOJSON_URL);
    console.log(`[globe] تم تحميل ${countries.length} دولة`);

    // ارسم كل الحدود مرة واحدة
    geo.drawAllBorders();

    ui.hideLoader();
    ui.setStatus(`جاهز — ${countries.length} دولة. انقر لعرض التفاصيل.`);

    // -------- أحداث المشهد --------
    let hoveredCountry = null;

    container.addEventListener('globe:hover', (e) => {
      const { lat, lon, screenX, screenY } = e.detail;
      const country = geo.findCountryAt(lat, lon);

      if (country) {
        if (hoveredCountry !== country) {
          hoveredCountry = country;
          globe.renderer.domElement.style.cursor = 'pointer';
        }
        ui.showTooltip(country.name, lat, lon, screenX, screenY);
      } else {
        hoveredCountry = null;
        globe.renderer.domElement.style.cursor = 'grab';
        ui.hideTooltip();
      }
    });

    container.addEventListener('globe:hover-out', () => {
      hoveredCountry = null;
      globe.renderer.domElement.style.cursor = 'grab';
      ui.hideTooltip();
    });

    container.addEventListener('globe:click', (e) => {
      const { lat, lon } = e.detail;
      const country = geo.findCountryAt(lat, lon);
      if (!country) return;

      // رسم الحدود المميزة
      geo.drawHighlightedBorders(country);

      // عرض اللوحة
      ui.showPanel(country, lat, lon);

      // إيقاف الدوران مؤقتًا ثم استئنافه
      globe.setAutoRotate(false);
      clearTimeout(window.__globeResumeTimer);
      window.__globeResumeTimer = setTimeout(
        () => globe.setAutoRotate(true),
        10000
      );
    });
  } catch (err) {
    console.error(err);
    ui.hideLoader();
    ui.setStatus('تعذّر تحميل البيانات. تحقّق من الاتصال بالإنترنت.', false);
  }
});