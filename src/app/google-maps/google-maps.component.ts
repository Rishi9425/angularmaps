import { Component, OnInit } from '@angular/core';
import { GoogleMap, MapMarker } from "@angular/google-maps";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-google-maps',
  standalone: true,
  imports: [GoogleMap, CommonModule, MapMarker],
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
    // Fix for multiple maps issue
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

  // Reverse geocoding to get city information
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
        
        // Get primary components
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
        
        // Fallback for city if not found
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
        
        // Use formatted address parts if still no city
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
        // Fallback when geocoding fails
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
    setTimeout(() => {
      // Add print-specific class to body for better control
      document.body.classList.add('printing');
      
      // Wait a bit more for any final rendering
      setTimeout(() => {
        window.print();
        
        // Remove print class after printing
        setTimeout(() => {
          document.body.classList.remove('printing');
        }, 1000);
      }, 200);
    }, 300);
  }
}