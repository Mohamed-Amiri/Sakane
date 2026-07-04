import { Component, Input, OnChanges, AfterViewInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() locations: any[] = [];
  private map: any;
  private markers: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then(L => {
        // Fix for default icon issue with webpack
        const iconRetinaUrl = 'assets/marker-icon-2x.png';
        const iconUrl = 'assets/marker-icon.png';
        const shadowUrl = 'assets/marker-shadow.png';
        const iconDefault = L.icon({
          iconRetinaUrl,
          iconUrl,
          shadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = iconDefault;
        this.initMap(L);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locations'] && this.map) {
      this.updateMarkers();
    }
  }

  private initMap(L: any): void {
    this.map = L.map('map', {
      center: [46.2276, 2.2137], // Centered on France
      zoom: 5
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: ' OpenStreetMap contributors'
    }).addTo(this.map);

    this.markers = L.layerGroup();
    this.markers.addTo(this.map);
    this.updateMarkers(L);
  }

  private updateMarkers(L?: any): void {
    if (!this.markers) return;
    this.markers.clearLayers();

    if (!this.locations || this.locations.length === 0) {
      return;
    }

    this.locations.forEach(loc => {
      const marker = L ? L.marker([loc.lat, loc.lng]) : null;
      if (marker) {
        marker.bindPopup(`<b>${loc.titre}</b><br>${loc.prix} DH/jour`);
        this.markers.addLayer(marker);
      }
    });

    // Fit map to markers
    if (L) {
      const group = L.featureGroup(this.markers.getLayers());
      if (group.getLayers().length > 0) {
        this.map.fitBounds(group.getBounds().pad(0.5));
      }
    }
  }
}
