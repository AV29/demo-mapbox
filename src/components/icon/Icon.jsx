import React from 'react';
import {func, number, string, object, bool} from 'prop-types';
import classNames from 'classnames';
import Icons from './Icons.js';
import styles from './Icon.less';

function Icon({icon = 'logo', className, onClick, disabled, ...props}) {

  const handleClick = (event) => {
    onClick && !disabled && onClick(event);
  };

  const IconComponent = Icons[icon];

  return (
    <i
      className={classNames(
        styles.icon,
        {[styles[className]]: className},
        {[styles.disabled]: disabled}
      )}
      onClick={handleClick}
      {...props}
    >
      {IconComponent ? <IconComponent/> : '*'}
    </i>
  );
}

Icon.propTypes = {
  style: object,
  icon: string,
  title: string,
  className: string,
  onClick: func,
  disabled: bool
};

export default Icon;
