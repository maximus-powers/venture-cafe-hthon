"use client";
import React, { useState, useEffect } from 'react';

const AllEntitiesMapViewer = () => {
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxDistance, setMaxDistance] = useState(20000); // Initial max distance
  const parcelsPerPage = 10;

  useEffect(() => {
    fetch('/maps/ranked_parcels.geojson')
      .then((response) => response.json())
      .then((data) => {
        setParcels(data.features);
      });
  }, []);

  useEffect(() => {
    const iframe = document.getElementById('mapIframe');
    iframe.onload = () => {
      const script = document.createElement('script');
      script.innerHTML = `
        (function() {
          var layers = {};
          var map = window.map_ce8e88ee7ab130b36b5f484f5ba8ff80;

          function highlightParcel(parcelId) {
              if (layers[parcelId]) {
                  layers[parcelId].openPopup();
                  map.setView(layers[parcelId].getLatLng(), 14);
              }
          }

          function onEachFeature(feature, layer) {
              if (feature.properties && feature.properties.id) {
                  layers[feature.properties.id] = layer;
                  layer.bindPopup(feature.properties.popup_text);
              }
          }

          // Load ranked parcels GeoJSON data
          fetch('/maps/ranked_parcels.geojson')
            .then(response => response.json())
            .then(data => {
              L.geoJSON(data, {
                  onEachFeature: onEachFeature
              }).addTo(map);
            });

          window.addEventListener('message', function (event) {
              var parcelId = event.data;
              highlightParcel(parcelId);
          });
        })();
      `;
      iframe.contentWindow.document.body.appendChild(script);
    };
  }, []);

  const handleParcelSelect = (parcelId) => {
    setSelectedParcel(parcelId);
    const iframe = document.getElementById('mapIframe');
    iframe.contentWindow.postMessage(parcelId, '*');
  };

  const filteredParcels = parcels.filter(
    (parcel) => parcel.properties.shortest_distance <= maxDistance
  );

  const indexOfLastParcel = currentPage * parcelsPerPage;
  const indexOfFirstParcel = indexOfLastParcel - parcelsPerPage;
  const currentParcels = filteredParcels.slice(indexOfFirstParcel, indexOfLastParcel);

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="flex flex-col h-screen">
      <iframe
        id="mapIframe"
        src="/maps/all_entities.html"
        className="w-full h-3/5 border-none"
        title="Interactive Map"
      />
      <div className="p-4 flex-grow overflow-auto bg-gray-100">
        <div className="mb-4">
          <label htmlFor="maxDistance" className="block text-sm font-medium text-gray-700">
            Max Shortest Distance (meters)
          </label>
          <input
            type="range"
            id="maxDistance"
            name="maxDistance"
            min="0"
            max="20000"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="block text-sm text-gray-500 mt-2">{maxDistance} meters</span>
        </div>
        <ul className="bg-white shadow sm:rounded-md">
          {currentParcels.map((parcel) => (
            <li
              key={parcel.properties.id}
              onClick={() => handleParcelSelect(parcel.properties.id)}
              className="cursor-pointer px-4 py-4 sm:px-6 hover:bg-gray-100 border-b border-gray-200"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-600">{parcel.properties.name}</p>
                <p className="text-sm text-gray-500">{parcel.properties.total_distance} meters</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={indexOfLastParcel >= filteredParcels.length}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllEntitiesMapViewer;
