import React, {Component} from 'react';
import {object, string, instanceOf, func, number, bool, shape} from 'prop-types';
import MapboxGl from 'mapbox-gl';
import data from '../../data/data.json';
import styles from './App.less';

class MapBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      defaultOptions: {
        failIfMajorPerformanceCaveat: true
      },
      defaultStyle: 'mapbox://styles/mapbox/basic-v9',
      mapboxApiAccessToken: 'pk.eyJ1IjoibGxhbWFzb2Z0IiwiYSI6ImNqZm83cnJuODAxdHUzMnBtNGdjdnJmbHcifQ.FaBPhi3i57XdDfj5pleNJg',
      layer: {
        'id': 'DEMO_LAYER',
        'type': 'circle',
        'source': this.prepareSource(data),
        'paint': {
          'circle-radius': 8,
          'circle-color': '#ba52f0',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#000000'
          // Use a get expression (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-get)
        }
      }
    };


    this.handleLoaded = this.handleLoaded.bind(this);
  }

  /* --------------------------------------------- React LifeCycle ---------------------------------------------------*/
  componentDidMount() {
    const {defaultStyle, mapboxApiAccessToken, defaultOptions} = this.state;
    MapboxGl.accessToken = mapboxApiAccessToken;
    this.initialize('map', defaultStyle, defaultOptions);
  }

  componentWillUnmount() {
    this.destroy();
  }

  /* ----------------------------------------------- Core Actions ----------------------------------------------------*/

  initialize(container, style, options) {
    const zoom = 4;
    const center = [-74.50, 40];
    this.map = new MapboxGl.Map({style, container, zoom, center, ...options});
    this.map.once('load', this.handleLoaded);
  }

  destroy() {
    this.map.remove();
    this.map = null;
  }

  handleLoaded() {
    this.map.resize();
    this.attachLayer(this.state.layer);
  }

  /* -------------------------------------------- MapBox Processing --------------------------------------------------*/

  attachLayer(layer) {
    this.map.addLayer(layer);
  }

  prepareSource(sourceData) {
    return {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: sourceData.map(data =>
          ({
            type: 'Feature',
            properties: {
              'featureId': data.id,
              tooltip: data.tooltip
            },
            geometry: {
              type: 'Point',
              coordinates: [data.lg, data.lt]
            }
          })
        )
      }
    };
  }

  render() {
    return (
      <div
        id="map"
        className={styles.map}
      />
    );
  }
}

MapBox.propTypes = {
};

export default MapBox;


