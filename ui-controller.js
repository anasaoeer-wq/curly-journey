/**
 * ui-controller.js — إدارة Tooltip ولوحة البيانات الجانبية.
 */
export class UIController {
  constructor() {
    this.tooltip = document.getElementById('tooltip');
    this.panel = document.getElementById('info-panel');
    this.status = document.getElementById('status');
    this.loader = document.getElementById('loader');

    this.fields = {
      name: document.getElementById('country-name'),
      iso: document.getElementById('country-iso'),
      flag: document.getElementById('country-flag'),
      area: document.getElementById('v-area'),
      pop: document.getElementById('v-pop'),
      region: document.getElementById('v-region'),
      subregion: document.getElementById('v-subregion'),
      lat: document.getElementById('v-lat'),
      lon: document.getElementById('v-lon'),
      borders: document.getElementById('v-borders'),
    };

    document
      .getElementById('close-panel')
      .addEventListener('click', () => this.hidePanel());
  }

  hideLoader() { this.loader.classList.add('hidden'); }

  showTooltip(name, lat, lon, x, y) {
    this.tooltip.innerHTML = `${name}<span class="coord">${lat}° , ${lon}°</span>`;
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
    this.tooltip.classList.remove('hidden');
  }

  hideTooltip() { this.tooltip.classList.add('hidden'); }

  showPanel(country, lat, lon) {
    const f = this.fields;
    f.name.textContent = country.name;
    f.iso.textContent = country.iso || '—';
    f.flag.textContent = this._flagEmoji(country.iso);

    f.area.textContent = country.area
      ? `${Math.round(country.area).toLocaleString('ar-EG')} كم²`
      : 'غير متاح';

    f.pop.textContent = country.population
      ? Math.round(country.population).toLocaleString('ar-EG')
      : 'غير متاح';

    f.region.textContent = country.region || '—';
    f.subregion.textContent = country.subregion || '—';
    f.lat.textContent = `${lat}°`;
    f.lon.textContent = `${lon}°`;
    f.borders.textContent = this._borderType(country);

    this.panel.classList.remove('hidden');
  }

  hidePanel() { this.panel.classList.add('hidden'); }

  setStatus(text, hide = false) {
    if (hide) {
      this.status.classList.add('hidden');
      return;
    }
    this.status.textContent = text;
    this.status.classList.remove('hidden');
  }

  _flagEmoji(iso2) {
    if (!iso2 || iso2.length < 2) return '🌍';
    const code = iso2.slice(0, 2).toUpperCase();
    // تحويل الحروف إلى رموز إقليمية (Regional Indicator Symbols)
    return String.fromCodePoint(
      ...[...code].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65))
    );
  }

  _borderType(country) {
    const g = country.geometry;
    if (!g) return '—';
    if (g.type === 'MultiPolygon' && g.coordinates.length > 1) {
      return 'بري + بحري + مائي';
    }
    return 'بري + مائي';
  }
}