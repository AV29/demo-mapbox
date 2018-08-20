import React, {Component} from 'react';
import {fromJS} from 'immutable';
import Layers from './Layers';
import MapboxGl from 'mapbox-gl';
import styles from './App.less';

const LAYER_NAME = 'DEMO_LAYER';

class MapBox extends Component {

  static generateSource(limit) {
    const data = [];
    for (let i = 0; i < limit; i += 1) {
      const currentFeature = {
        lt: Math.random() * 100 + 100,
        lg: Math.random() * 180,
        id: i
      };
      data.push(currentFeature);
    }
    return data;
  }

  static getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i += 1) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  constructor(props) {
    super(props);

    this.layersConfiguration = {
      layersAmount: 2,
      featuresAmount: 1000
    };

    this.state = {
      layers: fromJS([]),
      ready: false,
      defaultOptions: {
        failIfMajorPerformanceCaveat: true
      },
      defaultStyle: 'mapbox://styles/mapbox/basic-v9',
      mapboxApiAccessToken: 'pk.eyJ1IjoibGxhbWFzb2Z0IiwiYSI6ImNqZm83cnJuODAxdHUzMnBtNGdjdnJmbHcifQ.FaBPhi3i57XdDfj5pleNJg'
    };


    this.handleLoaded = this.handleLoaded.bind(this);
    this.handleChangeColor = this.handleChangeColor.bind(this);
    this.handleMoveLayerOnTop = this.handleMoveLayerOnTop.bind(this);
    this.handleChangeVisibility = this.handleChangeVisibility.bind(this);
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
    const zoom = 2;
    const center = [93, 50];
    this.map = new MapboxGl.Map({style, container, zoom, center, ...options});
    this.map.once('load', this.handleLoaded);
  }

  destroy() {
    this.map.remove();
    this.map = null;
  }

  handleLoaded() {
    this.map.resize();
    this.attachLayers(this.layersConfiguration);
  }

  setStyle(layerName, propName, value) {
    this.map.setPaintProperty(layerName, propName, value);
  }

  handleChangeVisibility(layerName) {
    const nextVisibilityState = this.map.getLayoutProperty(layerName, 'visibility') !== 'visible' ? 'visible' : 'none';
    this.map.setLayoutProperty(layerName, 'visibility', nextVisibilityState);
    const targetLayerIndex = this.state.layers.findIndex(layer => layer.get('id') === layerName);
    this.setState(({layers}) => ({layers: layers.setIn([targetLayerIndex, 'visible'], nextVisibilityState === 'visible')}));
  }

  handleChangeColor(layerName) {
    const baseColor = MapBox.getRandomColor();
    this.setStyle(layerName, 'circle-color', baseColor);
    this.setStyle(layerName, 'circle-stroke-color', MapBox.getRandomColor());
    const targetLayerIndex = this.state.layers.findIndex(layer => layer.get('id') === layerName);
    this.setState(({layers}) => ({layers: layers.setIn([targetLayerIndex, 'color'], baseColor)}));
  }

  handleMoveLayerOnTop(layerName) {
    const allLayers = this.map.getStyle().layers;
    if (allLayers[allLayers.length - 1].id === layerName) {
      return;
    }
    this.map.moveLayer(layerName);
    const targetLayerIndex = this.state.layers.findIndex(layer => layer.get('id') === layerName);
    this.setState(({layers}) => ({layers: layers.delete(targetLayerIndex).insert(0, this.state.layers.get(targetLayerIndex))}));
  }

  attachLayers({layersAmount, featuresAmount}) {
    let layers = fromJS([]);
    for (let i = 0; i < layersAmount; i += 1) {
      const layer = this.createLayer(featuresAmount, i);
      const stateLayer = fromJS({id: layer.id, visible: true, color: layer.paint['circle-color']});
      layers = layers.withMutations(list => list.push(stateLayer));
      this.map.addLayer(layer);
    }
    this.setState({layers});
  }

  createLayer(featuresAmount, id) {
    const color = MapBox.getRandomColor();
    return {
      'id': `${LAYER_NAME}_${id}`,
      'type': 'circle',
      'source': this.prepareSource(MapBox.generateSource(featuresAmount)),
      'paint': {
        'circle-radius': ['get', 'size'],
        'circle-color': color,
        'circle-stroke-width': 1,
        'circle-stroke-color': MapBox.getRandomColor()
        // Use a get expression (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-get)
      }
    };
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
              tooltip: data.tooltip,
              size: Math.random() * 29
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
      <div className={styles.appWrapper}>
        <div
          id="map"
          className={styles.map}
        />
        <div className={styles.controlWrapper}>
          <Layers
            onChangeVisibility={this.handleChangeVisibility}
            onPaintRandomly={this.handleChangeColor}
            onMoveTop={this.handleMoveLayerOnTop}
            layers={this.state.layers}
          />
        </div>
      </div>
    );
  }
}

export default MapBox;


