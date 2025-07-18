import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';

interface LocationDetails {
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-google-maps',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule],
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.css']
})
export class GoogleMapsComponent implements OnInit {
  zoom = 14;
  center: google.maps.LatLngLiteral = { lat: 28.6139, lng: 77.2090 }; // New Delhi
  markerPosition: google.maps.LatLngLiteral = this.center;
  locationDetails: LocationDetails | null = null;
  isLoadingLocationDetails = false;

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChild('marker') marker!: MapMarker;

  mapOptions: google.maps.MapOptions = {
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    clickableIcons: false
  };

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP,
    title: 'Click to see location details'
  };

  ngOnInit() {
    this.getLocationDetails(this.markerPosition.lat, this.markerPosition.lng);
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Update marker position
      this.markerPosition = { lat, lng };
      
      // Get location details and open info window immediately
      this.getLocationDetails(lat, lng);
      
      // Open info window after a short delay to ensure marker is updated
      setTimeout(() => {
        if (this.infoWindow && this.marker) {
          this.infoWindow.open(this.marker);
        }
      }, 100);
    }
  }

  getLocationDetails(lat: number, lng: number) {
    // Prevent multiple simultaneous calls
    if (this.isLoadingLocationDetails) {
      return;
    }
    
    this.isLoadingLocationDetails = true;
    
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };
    
    geocoder.geocode({ location: latlng }, (results, status) => {
      this.isLoadingLocationDetails = false;
      
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        const components = result.address_components;
        
        let city = '';
        let state = '';
        let country = '';
        
        components?.forEach(component => {
          const types = component.types;
          if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (types.includes('country')) {
            country = component.long_name;
          }
        });
        
        this.locationDetails = {
          address: result.formatted_address,
          city: city || 'N/A',
          state: state || 'N/A',
          country: country || 'N/A',
          lat: parseFloat(lat.toFixed(6)),
          lng: parseFloat(lng.toFixed(6))
        };
      } else {
        this.locationDetails = {
          address: 'Address not found',
          city: 'N/A',
          state: 'N/A',
          country: 'N/A',
          lat: parseFloat(lat.toFixed(6)),
          lng: parseFloat(lng.toFixed(6))
        };
      }
    });
  }

  printMap() {
    
    window.print();
  }
}