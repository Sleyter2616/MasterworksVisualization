import React, { useEffect, useRef } from 'react';
import { FeatureCollection } from 'geojson';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import 'leaflet.markercluster';

interface MapVisualizationProps {
  geoData: FeatureCollection;
  citySummary: Record<string, { count: number; totalAveragePricePerSqft: number; cityName: string }>;
}

const MarkerClusterComponent: React.FC<MapVisualizationProps> = ({ geoData, citySummary }) => {
  console.log('geoData:', geoData, 'citySummary:', citySummary);

  const markerIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const map = useMap();
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!markerClusterGroupRef.current) {
      markerClusterGroupRef.current = L.markerClusterGroup();
      map.addLayer(markerClusterGroupRef.current);
    }

    const markers: L.Marker[] = geoData.features
      .map((feature) => {
        if (feature.geometry.type !== 'Point' || !feature.geometry.coordinates) {
          console.log('Invalid feature:', feature);
          return null;
        }

        const latlng = L.latLng(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
        console.log('latlng:', latlng);

        const city = feature.properties?.citi;
        const count = citySummary[city]?.count || 0;
        const avgPrice = citySummary[city]?.totalAveragePricePerSqft || 0;
        const popupContent = `
          <h4>${city}</h4>
          <p><strong>Number of Properties:</strong> ${count}</p>
          <p><strong>Average Price per Square Foot:</strong> $${avgPrice.toFixed(2)}</p>`;

        return L.marker(latlng, { icon: markerIcon }).bindPopup(popupContent);
      })
      .filter((marker): marker is L.Marker => marker !== null);

    // Calculate the bounds of all markers
    const bounds = L.latLngBounds(markers.map((marker) => marker.getLatLng()));

    // Set the map view to the bounds of all markers with a reasonable zoom level
    map.fitBounds(bounds, { padding: [50, 50] });

    if (markerClusterGroupRef.current) {
      markerClusterGroupRef.current.clearLayers();
      markerClusterGroupRef.current.addLayers(markers);
      console.log(markers, 'markers?');
    }

    return () => {
      if (markerClusterGroupRef.current) {
        map.removeLayer(markerClusterGroupRef.current);
      }
    };
  }, [map, geoData, citySummary, markerIcon]);
  
  return null;
};

const MapVisualization: React.FC<MapVisualizationProps> = (props) => {
    const defaultPosition: [number, number] = [33.833, -117.918];
    
    return (
    <div className="MapVisualization">
    <MapContainer center={defaultPosition} zoom={10} style={{ height: '800px', width: '100%' }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="Map data © OpenStreetMap contributors" />
    <MarkerClusterComponent {...props} />
    </MapContainer>
    </div>
    );
    };
    
    export default MapVisualization;
    
    
    
    
