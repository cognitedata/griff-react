import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { withInfo, setDefaults } from '@storybook/addon-info';

setDefaults({ inline: true, header: false });

addDecorator((story, context) => (
  <div style={{ backgroundColor: '#f3f3f3' }}>
    <div
      style={{
        backgroundColor: '#fff',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '80%',
      }}
    >
      {withInfo()(story)(context)}
    </div>
  </div>
));

configure(require.context('../stories', true, /\.stories\.(tsx|js)$/), module);
