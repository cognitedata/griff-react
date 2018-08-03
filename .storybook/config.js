import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { withInfo, setDefaults } from '@storybook/addon-info';
import '@storybook/addon-actions/register';

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

setDefaults({ inline: true, header: false });

addDecorator((story, context) => (
  <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
    {withInfo()(story)(context)}
  </div>
));

configure(loadStories, module);
