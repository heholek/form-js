import { Fragment } from 'preact';


export default function Palette(props) {
  const fieldRenderers = props.fieldRenderers.filter((fieldRenderer) => {
    return fieldRenderer.type !== 'default';
  });

  return <Fragment>
    <div class="palette-header">FORM ELEMENTS LIBRARY</div>
    <div class="palette drag-container">
      {
        fieldRenderers.map((fieldRenderer) => {
          const { type, label, icon } = fieldRenderer;

          return (
            <div class="palette-field drag-copy no-drop" data-field-type={ type }>
              {
                icon ? <img class="palette-field-icon" src={ icon } /> : null
              }
              <span>{ label }</span>
            </div>
          );
        })
      }
    </div>
  </Fragment>;
}