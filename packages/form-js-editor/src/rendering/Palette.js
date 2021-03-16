import { Fragment } from 'preact';

import TextfieldIcon from './icons/Textfield.svg';

const types = [
  {
    Icon: TextfieldIcon,
    label: 'Text Field',
    type: 'textfield'
  }
];


export default function Palette(props) {
  return <Fragment>
    <div class="palette-header">FORM ELEMENTS LIBRARY</div>
    <div class="palette drag-container">
      {
        types.map(({ Icon, label, type }) => {
          return (
            <div class="palette-field drag-copy no-drop" data-field-type={ type }>
              {
                Icon ? <Icon class="palette-field-icon" /> : null
              }
              <span>{ label }</span>
            </div>
          );
        })
      }
    </div>
  </Fragment>;
}