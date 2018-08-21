import React, {Component} from 'react';
import {instanceOf, func} from 'prop-types';
import {List} from 'immutable';
import Icon from '../icon/Icon';
import styles from './Layers.less';

function Layers(props) {

  const {
    layers,
    onChangeVisibility,
    onPaintRandomly,
    onMoveTop,
    onRepaint,
    onRangeRepaint,
    onChangeRangeSize,
    onResize
  } = props;

  const handle = handler => id => event => handler && handler(id);

  return (
    <div className={styles.layers}>
      {layers.map(layer => {
        const id = layer.get('id');
        const visible = layer.get('visible');
        return (
          <div
            key={id}
            className={styles.layer}
          >
            <div
              className={styles.preview}
              style={{backgroundColor: layer.get('color')}}
            />
            <div className={styles.controls}>
              <button onClick={handle(onChangeVisibility)(id)}>
                {
                  visible
                    ? <Icon icon="eyeOpened"/>
                    : <Icon icon="eyeClosed"/>
                }
              </button>
              <button onClick={handle(onRepaint)(id)}>Re-Paint</button>
              <button onClick={handle(onPaintRandomly)(id)}>Paint Randomly</button>
              <button onClick={handle(onRangeRepaint)(id)}>Paint Ranges</button>
              <button onClick={handle(onChangeRangeSize)(id)}>Size Ranges</button>
              <button onClick={handle(onResize)(id)}>Re-Size</button>
              <button onClick={handle(onMoveTop)(id)}>Move On Top</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

Layers.propTypes = {
  layers: instanceOf(List),
  onChangeVisibility: func,
  onRepaint: func,
  onPaintRandomly: func,
  onRangeRepaint: func,
  onChangeRangeSize: func,
  onResize: func,
  onMoveTop: func
};

export default Layers;
