import React, {Component} from 'react';
import {fromJS} from 'immutable';
import Layers from './Layers';
import MapboxGl from 'mapbox-gl';
import classNames from 'classnames';
import styles from './App.less';

const LAYER_NAME = 'DEMO_LAYER';

class MapBox extends Component {

  static generateSource(pointsPerLayer) {
    const data = [];
    for (let i = 0; i < pointsPerLayer; i += 1) {
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
      pointsPerLayer: 1000
    };

    this.pointsPerLayer = null;
    this.layersAmount = null;

    this.state = {
      chartResult: [],
      layers: fromJS([]),
      ready: false,
      result: 0,
      defaultOptions: {
        failIfMajorPerformanceCaveat: true
      },
      defaultStyle: 'mapbox://styles/mapbox/basic-v9',
      mapboxApiAccessToken: 'pk.eyJ1IjoibGxhbWFzb2Z0IiwiYSI6ImNqZm83cnJuODAxdHUzMnBtNGdjdnJmbHcifQ.FaBPhi3i57XdDfj5pleNJg'
    };

    this.getTiming = this.getTiming.bind(this);
    this.handleLoaded = this.handleLoaded.bind(this);
    this.handleChangeColor = this.handleChangeColor.bind(this);
    this.handleApplyNewLayers = this.handleApplyNewLayers.bind(this);
    this.handleMoveLayerOnTop = this.handleMoveLayerOnTop.bind(this);
    this.handleChangeVisibility = this.handleChangeVisibility.bind(this);
  }

  /* --------------------------------------------- React LifeCycle ---------------------------------------------------*/
  componentDidMount() {
    const {mapboxApiAccessToken} = this.state;
    MapboxGl.accessToken = mapboxApiAccessToken;
    this.initialize(this.layersConfiguration);
  }

  componentWillUnmount() {
    this.destroy();
  }

  /* ----------------------------------------------- Core Actions ----------------------------------------------------*/

  initialize(layersConfiguration) {
    const zoom = 2;
    const center = [93, 50];
    this.setTiming();
    this.setState({ready: false});
    this.map = new MapboxGl.Map({
      style: this.state.defaultStyle,
      container: 'map',
      zoom,
      center,
      ...this.state.defaultOptions
    });
    this.map.on('render', this.getTiming);
    this.map.once('load', () => this.handleLoaded(layersConfiguration));
  }

  destroy() {
    this.map.remove();
    this.map = null;
  }

  handleLoaded(layersConfiguration) {
    this.map.resize();
    this.attachLayers(layersConfiguration);
  }

  getTiming() {
    this.setState({result: performance.now() - this.start});
  }

  setTiming() {
    this.start = performance.now();
  }

  setStyle(layerName, propName, value) {
    this.map.setPaintProperty(layerName, propName, value);
  }

  handleChangeVisibility(layerName) {
    const nextVisibilityState = this.map.getLayoutProperty(layerName, 'visibility') !== 'visible' ? 'visible' : 'none';
    this.map.setLayoutProperty(layerName, 'visibility', nextVisibilityState);
    this.setTiming();
    const targetLayerIndex = this.state.layers.findIndex(layer => layer.get('id') === layerName);
    this.setState(({layers}) => ({layers: layers.setIn([targetLayerIndex, 'visible'], nextVisibilityState === 'visible')}));
  }

  handleChangeColor(layerName) {
    const baseColor = MapBox.getRandomColor();
    this.setStyle(layerName, 'circle-color', baseColor);
    this.setStyle(layerName, 'circle-stroke-color', MapBox.getRandomColor());
    const targetLayerIndex = this.state.layers.findIndex(layer => layer.get('id') === layerName);
    this.setTiming();
    this.setState(({layers}) => ({layers: layers.setIn([targetLayerIndex, 'color'], baseColor)}));
  }

  handleMoveLayerOnTop(layerName) {
    const allLayers = this.map.getStyle().layers;
    if (allLayers[allLayers.length - 1].id === layerName) {
      return;
    }
    this.map.moveLayer(layerName);
    const targetLayerIndex = this.state.layers.findIndex(layer => layer.get('id') === layerName);
    this.setTiming();
    this.setState(({layers}) => ({layers: layers.delete(targetLayerIndex).insert(0, this.state.layers.get(targetLayerIndex))}));
  }

  handleApplyNewLayers() {
    const layersConfiguration = {
      layersAmount: parseInt(this.layersAmount.value),
      pointsPerLayer: parseInt(this.pointsPerLayer.value)
    };
    this.destroy();
    this.initialize(layersConfiguration);
  }

  attachLayers({layersAmount, pointsPerLayer}) {
    let layers = fromJS([]);
    const mapBoxLayers = [];
    for (let i = 0; i < layersAmount; i += 1) {
      const layer = this.createLayer(pointsPerLayer, i);
      const stateLayer = fromJS({id: layer.id, visible: true, color: layer.paint['circle-color']});
      mapBoxLayers.push(layer);
      layers = layers.withMutations(list => list.push(stateLayer));
    }
    mapBoxLayers.reverse().forEach(layer => this.map.addLayer(layer));
    this.setState({layers, ready: true});
  }

  createLayer(pointsPerLayer, id) {
    const color = MapBox.getRandomColor();
    return {
      'id': `${LAYER_NAME}_${id}`,
      'type': 'circle',
      'source': this.prepareSource(MapBox.generateSource(pointsPerLayer)),
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
        {
          this.state.ready &&
          <div className={classNames(styles.wrapper, styles.layers)}>
            <Layers
              onChangeVisibility={this.handleChangeVisibility}
              onPaintRandomly={this.handleChangeColor}
              onMoveTop={this.handleMoveLayerOnTop}
              layers={this.state.layers}
            />
          </div>
        }
        <div className={classNames(styles.wrapper, styles.form)}>
          <div className={styles.input}>
            <label htmlFor="layersAmount">Amount of Layers</label>
            <input
              id="layersAmount"
              defaultValue={this.layersConfiguration.layersAmount}
              ref={i => this.layersAmount = i}
              type="number"
            />
          </div>
          <div className={styles.input}>
            <label htmlFor="pointsPerLayer">Points Per Layer</label>
            <input
              id="pointsPerLayer"
              defaultValue={this.layersConfiguration.pointsPerLayer}
              ref={i => this.pointsPerLayer = i}
              type="number"
            />
          </div>
          <button onClick={this.handleApplyNewLayers}>Apply!</button>
        </div>
        <div className={classNames(styles.result, styles.wrapper)}>
          {`${(this.state.result / 1000).toFixed(3)} s`}
        </div>
      </div>
    );
  }
}

export default MapBox;


