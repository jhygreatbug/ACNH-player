const path = require('path');
console.log('------------------')

module.exports = {
  packagerConfig: {
    platform: ['darwin', 'win32'],
    icon: path.join(__dirname, './src/assets/icon'),
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'animal_crossing_new_horizons_player',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
