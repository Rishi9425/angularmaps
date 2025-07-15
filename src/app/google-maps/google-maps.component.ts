import { Component, OnInit } from '@angular/core';
import { GoogleMap, MapMarker} from "@angular/google-maps";
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-google-maps',
  standalone: true,
  imports: [GoogleMap, CommonModule, MapMarker, CardModule, ButtonModule, PanelModule],
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.css']
})
export class GoogleMapsComponent implements OnInit {
  
  constructor() { }

  ngOnInit(): void {
    // Set default location to Los Angeles
    this.display = { lat: 34.0522, lng: -118.2437 };
    this.center = { lat: 34.0522, lng: -118.2437 };
    
    // Initialize with Los Angeles info
    this.locationInfo = {
      city: 'Los Angeles',
      lat: '34.0522',
      lng: '-118.2437',
      country: 'United States',
      state: 'California',
      fullAddress: 'Los Angeles, CA, USA'
    };
    
    // Get geocoded information for Los Angeles
    setTimeout(() => {
      this.getCityInfo(this.center);
    }, 1000);
  }
  
  display: any;
  locationInfo: any;
  markerPosition: google.maps.LatLngLiteral | undefined = undefined;
  showInfoCard = false;
  isFullScreen = false;
  infoCardPosition = { x: 0, y: 0 };
  
  center: google.maps.LatLngLiteral = {lat: 34.0522, lng: -118.2437};
  zoom = 10;
  
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    scrollwheel: true,
    disableDefaultUI: false,
    disableDoubleClickZoom: false,
    fullscreenControl: true,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    gestureHandling: 'auto',
    restriction: {
      latLngBounds: {
        north: 85,
        south: -85,
        west: -180,
        east: 180
      },
      strictBounds: false
    }
  };

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP
  };

  moveMap(event: google.maps.MapMouseEvent) {
    if(event.latLng != null) {
      this.markerPosition = event.latLng.toJSON();
      this.display = event.latLng.toJSON();
      this.getCityInfo(event.latLng.toJSON());
      this.showInfoCard = true;
      this.updateInfoCardPosition(event);
    }
  }

  move(event: google.maps.MapMouseEvent) {
    if(event.latLng != null) {
      this.display = event.latLng.toJSON();
    }
  }

  closeInfoCard() {
    this.showInfoCard = false;
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    
    if (this.isFullScreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  updateInfoCardPosition(event: google.maps.MapMouseEvent) {
    const mapDiv = document.querySelector('google-map') as HTMLElement;
    if (mapDiv && event.domEvent) {
      const rect = mapDiv.getBoundingClientRect();
      let x = 0;
      let y = 0;

      if ('clientX' in event.domEvent && 'clientY' in event.domEvent) {
        x = (event.domEvent as MouseEvent | PointerEvent).clientX - rect.left;
        y = (event.domEvent as MouseEvent | PointerEvent).clientY - rect.top;
      } else if ('touches' in event.domEvent && (event.domEvent as TouchEvent).touches.length > 0) {
        x = (event.domEvent as TouchEvent).touches[0].clientX - rect.left;
        y = (event.domEvent as TouchEvent).touches[0].clientY - rect.top;
      }

      // Smart positioning logic
      const mapWidth = rect.width;
      const mapHeight = rect.height;
      const cardWidth = 300; // Approximate card width
      const cardHeight = 350; // Approximate card height
      const padding = 20;

      let finalX = x;
      let finalY = y;

      // Horizontal positioning
      if (x + cardWidth + padding > mapWidth) {
        // Not enough space on right, position on left
        finalX = x - cardWidth - padding;
      } else {
        // Enough space on right, position on right
        finalX = x + padding;
      }

      // Vertical positioning
      if (y + cardHeight + padding > mapHeight) {
        // Not enough space below, position above
        finalY = y - cardHeight - padding;
      } else {
        // Enough space below, position below
        finalY = y + padding;
      }

      // Ensure card doesn't go off-screen
      finalX = Math.max(padding, Math.min(finalX, mapWidth - cardWidth - padding));
      finalY = Math.max(padding, Math.min(finalY, mapHeight - cardHeight - padding));

      this.infoCardPosition = {
        x: finalX,
        y: finalY
      };
    }
  }

  getCityInfo(coordinates: google.maps.LatLngLiteral) {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({
      location: coordinates
    }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const addressComponents = results[0].address_components;
        
        let city = '';
        let state = '';
        let country = '';
        
        for (let component of addressComponents) {
          const types = component.types;
          
          if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (types.includes('country')) {
            country = component.long_name;
          }
        }
        
        if (!city) {
          for (let component of addressComponents) {
            const types = component.types;
            if (types.includes('sublocality_level_1') || 
                types.includes('sublocality') ||
                types.includes('administrative_area_level_2') ||
                types.includes('neighborhood') ||
                types.includes('postal_town')) {
              city = component.long_name;
              break;
            }
          }
        }
        
        if (!city && results[0].formatted_address) {
          const addressParts = results[0].formatted_address.split(',');
          if (addressParts.length > 1) {
            city = addressParts[0].trim();
          }
        }
        
        this.locationInfo = {
          city: city || 'Location Found',
          lat: coordinates.lat.toFixed(6),
          lng: coordinates.lng.toFixed(6),
          country: country || 'Unknown Country',
          state: state || 'Unknown Region',
          fullAddress: results[0].formatted_address || 'Address not available'
        };
        
      } else {
        this.locationInfo = {
          city: 'Location Found',
          lat: coordinates.lat.toFixed(6),
          lng: coordinates.lng.toFixed(6),
          country: 'Geocoding Failed',
          state: 'Please check API key',
          fullAddress: `Coordinates: ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
        };
      }
    });
  }

  printLocationInfo() {
    // Ensure the map is fully loaded and rendered

    
        window.print();
        
        // Remove print class after printing
         
  }
}