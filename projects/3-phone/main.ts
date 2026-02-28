import './style.css';
import { setupVylos } from '@vylos/core';
import config from './vylos.config';
import plugin from './setup';
import * as project from 'virtual:vylos-project';

setupVylos({ config, plugin, skipMainMenu: true, ...project });
