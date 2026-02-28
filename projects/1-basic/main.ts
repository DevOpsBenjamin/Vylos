import './style.css';
import { setupVylos } from '@vylos/core';
import config from './vylos.config';
import * as project from 'virtual:vylos-project';

setupVylos({ config, ...project });
