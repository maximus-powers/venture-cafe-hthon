import React from 'react';
import AllEntitiesMapViewer from '../components/AllEntitiesMap';

const Home = () => {
  return (
    <div>
      <h1 className="text-lg text-center my-3">Interactive Map with Ranked Parcels</h1>
      <AllEntitiesMapViewer />
    </div>
  );
};

export default Home;
