import React, {Component} from 'react';
import classNames from 'classnames';
import {instanceOf, func} from 'prop-types';
import {List} from 'immutable';
import styles from './Layers.less';

function Layers({layers, onChangeVisibility, onPaintRandomly, onMoveTop}) {

  const handle = handler => id => event => handler && handler(id);

  return (
    <div className={styles.layers}>
      {layers.map((layer, index) => {
        const id = layer.get('id');
        const visible = layer.get('visible');
        return (
          <div
            key={id}
            className={styles.layer}
          >
            <span className={styles.layerName}>{index}</span>
            <div className={styles.controls}>
              <button
                className={classNames({[styles.visible]: visible}, {[styles.hidden]: !visible})}
                onClick={handle(onChangeVisibility)(id)}
              >
                {visible ? 'Hide' : 'Show'}
              </button>
              <button onClick={handle(onPaintRandomly)(id)}>Paint</button>
              <button onClick={handle(onMoveTop)(id)}>Move On Top</button>
              <div
                className={styles.preview}
                style={{backgroundColor: layer.get('color')}}
              />
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
  onPaintRandomly: func,
  onMoveTop: func
};

export default Layers;
