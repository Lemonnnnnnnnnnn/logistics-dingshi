
import React from 'react';
import Map from '@/components/Map/Map.jsx'
import styles from './MapPage.css';

export default function() {
  return (
    <div className={styles.normal}>
      <div style={{ width: '80%', height: '500px', margin: '0 auto' }}>
        <Map />


      </div>
    </div>
  );
}
