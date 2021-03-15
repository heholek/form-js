import { Fragment } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';

import { debounce } from 'min-dash';

import { DefaultRenderer } from '@bpmn-io/form-js-viewer';

function Textfield(props) {
  const {
    label,
    value
  } = props;

  const debouncedOnInput = useCallback(debounce(props.onInput, 300), [ props.onInput ]);

  const onInput = ({ target }) => {
    debouncedOnInput(target.value);
  };

  return (
    <div class="fjs-properties-panel-textfield">
      <label>{ label }</label>
      <input type="text" onInput={ onInput } value={ value || '' } />
    </div>
  );
}

function Number(props) {
  const {
    label,
    value,
    onInput,
    ...rest
  } = props;

  const handleInput = ({ target }) => {
    onInput(target.value);
  };

  return (
    <div class="fjs-properties-panel-textfield">
      <label>{ label }</label>
      <input type="number" onInput={ handleInput } value={ value } { ...rest } />
    </div>
  );
}

function LabelProperty(props) {
  const {
    editField,
    field
  } = props;

  const onInput = (value) => {
    editField(field, 'label', value);
  };

  const value = useMemo(() => field.label, [ field.label ]);

  return (
    <div class="fjs-properties-panel-property">
      <Textfield label="Label" onInput={ onInput } value={ value } />
    </div>
  );
}

function ColumnsProperty(props) {
  const {
    editField,
    field
  } = props;

  const onInput = (value) => {
    let components = field.components.slice();

    if (value > components.length) {
      while(value > components.length) {
        components.push(DefaultRenderer.create({ parent: field.id }));
      }
    } else {
      components = components.slice(0, value);
    }

    editField(field, 'components', components);
  };

  const value = useMemo(() => field.components.length, [ field.components.length ]);

  return (
    <div class="fjs-properties-panel-property">
      <Number label="Columns" onInput={ onInput } value={ value } min="1" max="3" />
    </div>
  );
}

function getEntries(field, editField) {
  const { type } = field;

  return (
    <Fragment>
      {
        type !== 'columns' ? <LabelProperty editField={ editField } field={ field } /> : null
      }
      {
        type == 'columns' ? <ColumnsProperty editField={ editField } field={ field } /> : null
      }
    </Fragment>
  );
}

export default function PropertiesPanel(props) {
  const {
    editField,
    field = {}
  } = props;

  return <div class="fjs-properties-panel">
    <div class="fjs-properties-panel-header">
      {
        field.label
          ? <div class="fjs-properties-panel-header-label">{ field.label }</div>
          : null
      }
    </div>
    {
      getEntries(field, editField)
    }
  </div>;
};