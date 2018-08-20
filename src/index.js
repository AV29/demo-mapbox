import 'babel-polyfill';
import {render} from 'react-dom';
import React from 'react';
import App from './components/application-shell/App';
import './styles/styles.less';

render(
  <App/>,
  document.getElementById('application-root')
);
