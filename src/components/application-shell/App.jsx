import React, {Component} from 'react';
import {fromJS} from 'immutable';
import Layers from './Layers';
import MapboxGl from 'mapbox-gl';
import classNames from 'classnames';
import styles from './App.less';

const LAYER_NAME = 'DEMO_LAYER';

const config = {
  color: 'circle-color',
  size: 'circle-radius'
};

class MapBox extends Component {

  static generateSource(pointsPerLayer) {
    const data = [];
    for (let i = 0; i < pointsPerLayer; i += 1) {
      const currentFeature = {
        lt: MapBox.getRandomValue(-65, 90),
        lg: MapBox.getRandomValue(-180, 180),
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

  static getRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static rangeColors(data) {
    const latitude = data.getIn(['properties', 'latitude']);
    const longitude = data.getIn(['properties', 'longitude']);
    return (latitude > 0 && latitude < 50 && longitude > 0 && longitude < 50)
      ? data.mergeIn(['properties'], {color: '#ff5d62'})
      : data.mergeIn(['properties'], {color: '#67ff67'});
  }

  static rangeSize(data) {
    const latitude = data.getIn(['properties', 'latitude']);
    const longitude = data.getIn(['properties', 'longitude']);
    const previousSize = data.getIn(['properties', 'size']);
    return (latitude > 0 && latitude < 50 && longitude > 0 && longitude < 50)
      ? data.mergeIn(['properties'], {size: previousSize * 2})
      : data.mergeIn(['properties'], {size: previousSize / 2});
  }

  static randomizeColors(data) {
    return data.mergeIn(['properties'], {color: MapBox.getRandomColor()});
  }

  constructor(props) {
    super(props);

    this.layersConfiguration = {
      layersAmount: 1,
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
    this.changeSourceProperties = this.changeSourceProperties.bind(this);
    this.handleChangeSize = this.handleChangeSize.bind(this);
    this.handleChangeColor = this.handleChangeColor.bind(this);
    this.handleApplyNewLayers = this.handleApplyNewLayers.bind(this);
    this.handleMoveLayerOnTop = this.handleMoveLayerOnTop.bind(this);
    this.handleChangeVisibility = this.handleChangeVisibility.bind(this);
    this.handleChangeRandomColor = this.handleChangeRandomColor.bind(this);
    this.handleChangeRangeColor = this.handleChangeRangeColor.bind(this);
    this.handleChangeRangeSize = this.handleChangeRangeSize.bind(this);
    this.handleRepaintAll = this.handleRepaintAll.bind(this);
    this.handleResizeAll = this.handleResizeAll.bind(this);
    this.handleChangeVisibilityAll = this.handleChangeVisibilityAll.bind(this);
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
    const zoom = 1.5;
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

  handleRepaintAll() {
    let layers = fromJS([]);
    this.setTiming();
    this.state.layers.forEach(layer => {
      const color = MapBox.getRandomColor();
      this.setStyle(layer.get('id'), 'circle-color', color);
      layers = layers.withMutations(list => list.push(layer.merge({color})));
    });
    this.setState({layers});
  }

  handleResizeAll() {
    let layers = fromJS([]);
    this.setTiming();
    this.state.layers.forEach(layer => {
      const size = MapBox.getRandomValue(5, 15);
      this.setStyle(layer.get('id'), 'circle-radius', size);
      layers = layers.withMutations(list => list.push(layer.merge({size})));
    });
    this.setState({layers});
  }

  handleChangeVisibilityAll(visible) {
    return event => {
      let layers = fromJS([]);
      this.setTiming();
      this.state.layers.forEach(layer => {
        this.map.setLayoutProperty(layer.get('id'), 'visibility', visible ? 'visible' : 'none');
        layers = layers.withMutations(list => list.push(layer.merge({visible})));
      });
      this.setState({layers});
    };
  }

  handleChangeSize(layerName) {
    const size = MapBox.getRandomValue(5, 15);
    this.setStyle(layerName, 'circle-radius', size);
    this.setTiming();
  }

  handleChangeRandomColor(layerName) {
    this.changeSourceProperties(layerName, 'color', MapBox.randomizeColors);
    this.setTiming();
  }

  handleChangeRangeSize(layerName) {
    this.changeSourceProperties(layerName, 'size', MapBox.rangeSize);
    this.setTiming();
  }

  handleChangeRangeColor(layerName) {
    this.changeSourceProperties(layerName, 'color', MapBox.rangeColors);
    this.setTiming();
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
      const stateLayer = fromJS({
        id: layer.id,
        visible: true,
        color: layer.paint['circle-color'],
        features: layer.source.data.features
      });
      mapBoxLayers.push(layer);
      layers = layers.withMutations(list => list.push(stateLayer));
    }
    mapBoxLayers.reverse().forEach(layer => this.map.addLayer(layer));
    this.setState({layers, ready: true});
  }

  createLayer(pointsPerLayer, id) {
    const baseColor = MapBox.getRandomColor();
    const baseSize = MapBox.getRandomValue(5, 15);
    return {
      'id': `${LAYER_NAME}_${id}`,
      'type': 'circle',
      'source': {
        type: 'geojson',
        data: this.prepareSourceData(MapBox.generateSource(pointsPerLayer))
      },
      'paint': {
        'circle-radius': baseSize,
        'circle-color': baseColor,
        'circle-stroke-width': 1,
        'circle-stroke-color': MapBox.getRandomColor()
        // Use a get expression (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-get)
      }
    };
  }

  prepareSourceData(sourceData) {
    return {
      type: 'FeatureCollection',
      features: sourceData.map((data, index) =>
        ({
          type: 'Feature',
          properties: {
            'featureId': data.id,
            tooltip: data.tooltip,
            size: 20,
            color: '#ffffff',
            name: 'Anton',
            lastName: 'Vlasik',
            occupation: 'Developer',
            address: 'Chicherina',
            building: '4',
            latitude: data.lt,
            longitude: data.lg,
            city: 'Minsk',
            country: 'Belarus',
            zipcode: 220036,
            phone: 20000000
          },
          geometry: {
            type: 'Point',
            coordinates: [data.lg, data.lt]
          }
        })
      )
    };
  }

  changeSourceProperties(layerName, prop, predicate) {
    const targetLayerIndex = this.state.layers.findIndex(layer => layer.get('id') === layerName);
    this.setStyle(layerName, config[prop], ['get', prop]);
    const features = this.state.layers.getIn([targetLayerIndex, 'features']).map(predicate);
    const newSourceData = {
      type: 'FeatureCollection',
      features: features.toJS()
    };
    this.map.getSource(layerName).setData(newSourceData);
    this.setState(({layers}) => ({layers: layers.mergeIn([targetLayerIndex], {features})}));
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
          <div className={classNames(styles.fixedWrapper, styles.layers)}>
            <div className={styles.mainControls}>
              <button onClick={this.handleChangeVisibilityAll(true)}>Show All</button>
              <button onClick={this.handleChangeVisibilityAll(false)}>Hide All</button>
              <button onClick={this.handleResizeAll}>Resize All</button>
              <button onClick={this.handleResizeAll}>Resize All</button>
            </div>
            <Layers
              onChangeVisibility={this.handleChangeVisibility}
              onPaintRandomly={this.handleChangeRandomColor}
              onRangeRepaint={this.handleChangeRangeColor}
              onRepaint={this.handleChangeColor}
              onResize={this.handleChangeSize}
              onChangeRangeSize={this.handleChangeRangeSize}
              onMoveTop={this.handleMoveLayerOnTop}
              layers={this.state.layers}
            />
          </div>
        }
        <div className={classNames(styles.fixedWrapper, styles.form)}>
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
        <div className={classNames(styles.result, styles.fixedWrapper)}>
          {`${(this.state.result / 1000).toFixed(3)} s`}
        </div>
      </div>
    );
  }
}

export default MapBox;


