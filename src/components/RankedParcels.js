"use client";
import React, { useState, useEffect } from 'react';

const RankedParcels = ({ onSelectParcel }) => {
  const [parcels, setParcels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const parcelsPerPage = 5;

  useEffect(() => {
    fetch('/maps/ranked_parcels.geojson')
      .then((response) => response.json())
      .then((data) => {
        setParcels(data.features);
      });
  }, []);

  const indexOfLastParcel = currentPage * parcelsPerPage;
  const indexOfFirstParcel = indexOfLastParcel - parcelsPerPage;
  const currentParcels = parcels.slice(indexOfFirstParcel, indexOfLastParcel);

  const handleClick = (parcel) => {
    onSelectParcel(parcel.properties.id);
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div>
      <ul>
        {currentParcels.map((parcel) => (
          <li key={parcel.properties.id} onClick={() => handleClick(parcel)}>
            {parcel.properties.name} - {parcel.properties.total_distance} meters
          </li>
        ))}
      </ul>
      <div>
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <button onClick={nextPage} disabled={indexOfLastParcel >= parcels.length}>
          Next
        </button>
      </div>
    </div>
  );
};

export default RankedParcels;
