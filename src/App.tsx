import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import './App.css';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import { DataRow } from './components/types';
import DataTable from './components/DataTable';
import MapVisualization from './components/MapVisualization';
import axios from 'axios';
import BarChart from './components/BarChart';

const App: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [geoData, setGeoData] = useState<FeatureCollection>({ type: 'FeatureCollection', features: [] });
  const [citySummary, setCitySummary] = useState<Record<string, { count: number; totalAveragePricePerSqft: number; cityName: string }>>({});
  const [rowsPerPage, setRowsPerPage] = useState(15);


  const apiKey ='AIzaSyCmD6pPELKKEPLw--M3tB_nqpnuWplXEyQ'
  const folderId =  '1RQDH8bIfWL4GtF8mF8XT-brJeLEl9N2G';

  async function getGeoDataFeaturesAllAtOnce(typedData: DataRow[]) {
    const geoDataFeatures: Feature<Geometry, { citi: string }>[] = [];

    const cities = Array.from(new Set(typedData.map((row) => row.citi)));

    const requests = cities.map(async (city) => {
      const filteredData = typedData.filter((row) => row.citi === city);
      if (filteredData.length === 0) {
        return null;
      }

      // const cachedResult = localStorage.getItem(city);
   

      // if (cachedResult) {
      //   location = JSON.parse(cachedResult);

      let location = await geocodeCity(city);

      if ( location && location.geometry && location.geometry.location ) {

        return {
          type: 'Feature',
          properties: {
            citi: city,
          },
          geometry: {
            type: 'Point',
            coordinates: [location.geometry.location.lat, location.geometry.location.lng],
          },
        };
      } else {
        return null;
      }
    });

    const newGeoDataFeatures = (await Promise.all(requests)).filter((feature) => feature !== null) as Feature<Geometry, { citi: string }>[];
    geoDataFeatures.push(...newGeoDataFeatures);

    return geoDataFeatures;
  }


  async function geocodeCity(city: string) {
    const cachedResult = localStorage.getItem(city);

    if (cachedResult) {
      return JSON.parse(cachedResult);
    } else {

      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${apiKey}`);
      console.log(`Geocoding response for ${city}:`, response.data);
      const location = response.data.results[0];

      if (location) {
        localStorage.setItem(city, JSON.stringify(location));
        console.log('geocodeCity location:', location);
        return location;
      } else {
        console.log(`geocodeCity location not found for city: ${city}`);
        return null;
      }
    }
  }

  function aggregateCityData(data: DataRow[]) {
    const citySummary: Record<string, { count: number; totalAveragePricePerSqft: number; cityName: string }> = {};

    data.forEach((row) => {
      const cityName = row.citi;
      if (!citySummary[cityName]) {
        citySummary[cityName] = { count: 0, totalAveragePricePerSqft: 0, cityName };
      }
      citySummary[cityName].count += row.counts_locations;
      citySummary[cityName].totalAveragePricePerSqft += row.average_price_price_sqft;
    });

    // Calculate the average price per square foot for each city
    for (const city in citySummary) {
      const cityData = citySummary[city];
      cityData.totalAveragePricePerSqft /= cityData.count;
    }

    console.log('citySummary:', citySummary);
    return citySummary;
  };


  useEffect(() => {
    console.log('useEffect hook ran');
    d3.csv(`${process.env.PUBLIC_URL}/socal2.csv`).then(async (csvData) => {
      console.log('csv data:', csvData);
      const typedData: DataRow[] = csvData.map((row) => ({
        image_id: row.image_id ?? '',
        street: row.street ?? '',
        citi: row.citi ?? '',
        n_citi: row.n_citi ?? '',
        bed: parseInt(row.bed ?? '0', 10),
        bath: parseInt(row.bath ?? '0', 10),
        sqft: parseInt(row.sqft ?? '0', 10),
        price: parseInt(row.price ?? '0', 10),
        price_sqft: parseInt(row.price_sqft ?? '0', 10),
        counts_locations: parseInt(row.counts_locations ?? '0', 10),
        average_price_price_sqft: parseInt(row.average_price_price_sqft ?? '0', 10),
      }));
      console.log('typedData:', typedData);
      setData(typedData);
      const geoDataFeatures = await getGeoDataFeaturesAllAtOnce(typedData);
      console.log('geoDataFeatures in useEffect:', geoDataFeatures); 
      setGeoData({ type: 'FeatureCollection', features: geoDataFeatures });

      const citySummaryCopy = aggregateCityData(typedData);
      console.log('citySummary:', citySummaryCopy);
      setCitySummary(citySummaryCopy );


    });
  }, []);
  useEffect(() => {
    console.log('citySummary updated:', citySummary);
  }, [citySummary]);



return (
<div className="App">
<section>
  <h2>Bar chart</h2>
  <p># of Locations by city</p>
  <div style={{ display: 'block' }}>
    <BarChart data={data} yAxisTitle='Average' xAxisTitle='city' />
  </div>
</section>
<section>
<h2>Data Table</h2>
<DataTable
       data={data}
       apiKey={apiKey}
       folderId={folderId}
       rowsPerPage={rowsPerPage}
       setRowsPerPage={setRowsPerPage}
     />
</section>
<section>
  <h2>Map Visualization</h2>
  <div style={{ display: 'block' }}>
    {Object.keys(citySummary).length > 0 && (
      <MapVisualization geoData={geoData} citySummary={citySummary} />
    )}
  </div>
</section>


</div>
);
}
export default App;





