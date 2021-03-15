import { useContext, useState, useEffect, useCallback } from 'preact/hooks';

import {
  FormContext,
  FormRenderContext,
  Form
} from '@bpmn-io/form-js-viewer';

import {
  DragAndDropContext,
  FormEditorContext,
  SelectionContext
} from './context';

import Palette from './Palette';
import PropertiesPanel from './PropertiesPanel';

import * as dragula from 'dragula';

const removeSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg">
<g transform="translate(0 995.64)">
<g transform="matrix(96.753 0 0 96.753 55.328 -100816)">
<path transform="matrix(.010336 0 0 .010336 -.57185 1031.7)" d="m879 220.18c-118.95 7.1404-143.49-24.247-145 105.61v19.285l-353.5 113.6c-40.55 10.478-40.795 60.587 0 60.723h1278c40 1.161 38.571-50.486 0-60.723l-344.5-111.87v-21.012c0-127.32-13.022-98.542-145-105.61h-145zm-440.63 416.21c-29.317 0.0646-52.29 25.221-49.699 54.424l102.04 1135.3c2.3072 25.743 23.853 45.486 49.699 45.541h937.1c25.389 0.015 46.76-18.998 49.699-44.217l132.09-1135.3c3.4292-29.702-19.8-55.755-49.699-55.74h-292.81-292.81zm54.801 99.965h530.82 529.5l-120.38 1035.4h-846.96zm245.11 150.97c-1.8304-0.0876-3.6641-0.0837-5.4941 0.0117-32.481 1.7523-56.355 31.156-51.4 63.305l91.273 654.21c2.8631 31.254 31.254 53.781 62.34 49.465 31.086-4.3157 52.267-33.725 46.508-64.576l-91.273-654.21c-3.2799-26.57-25.213-46.919-51.953-48.203zm575.21 0.0117c-28.186-0.59596-52.26 20.215-55.746 48.191l-91.273 654.21c-5.7587 30.852 15.422 60.26 46.508 64.576 31.086 4.3157 59.477-18.211 62.34-49.464l91.272-654.21c5.0149-32.798-19.93-62.536-53.1-63.305z"/>
</g>
</g>
</svg>`;

function ContextPad(props) {
  if (!props.children) {
    return null;
  }

  return (
    <div class="fjs-context-pad">
      {
        props.children
      }
    </div>
  );
}

function Empty(props) {
  return null;
}

function Element(props) {
  const { selection, setSelection } = useContext(SelectionContext);

  const {
    fields,
    removeField
  } = useContext(FormEditorContext);

  const { field } = props;

  const { id } = field;

  function onClick(event) {
    event.stopPropagation();

    setSelection(id);
  }

  const classes = [ 'element' ];

  if (props.class) {
    classes.push(...props.class.split(' '));
  }

  if (selection === id) {
    classes.push('fjs-editor-selected');
  }

  const onRemove = () => {
    event.stopPropagation();

    const parentField = fields.get(field.parent);

    const index = getFieldIndex(parentField, field);

    removeField(parentField, index);
  };

  return (
    <div
      class={ classes.join(' ') }
      data-id={ id }
      onClick={ onClick }>
      <ContextPad>
        {
          selection === id ? <button class="fjs-context-pad-item" onClick={ onRemove }><img src={ `data:image/svg+xml;utf8,${ removeSvg }` } /></button> : null
        }
      </ContextPad>
      { props.children }
    </div>
  );
}

function Children(props) {
  const { id } = props;

  const classes = [ 'container', 'drag-container' ];

  if (props.class) {
    classes.push(...props.class.split(' '));
  }

  return (
    <div
      class={ classes.join(' ') }
      data-id={ id }>
      { props.children }
    </div>
  );
}

const drake = dragula({
  isContainer(el) {
    return el.classList.contains('drag-container');
  },
  copy(el) {
    return el.classList.contains('drag-copy');
  },
  accepts(el, target) {
    return !target.classList.contains('no-drop');
  }
});

export default function FormEditor(props) {
  const {
    fields,
    getFieldRenderer,
    fieldRenderers,
    addField,
    moveField,
    editField
  } = useContext(FormEditorContext);

  const { schema } = props;

  const [ selection, setSelection ] = useState(null);

  // TODO: This is a dirty hack.
  // When editing a field the field registration will update AFTER we get the it from the
  // field registry, to work around this issue we need to find the field in the schema instead.
  // It's like having an asynchronous element registry which makes no sense.
  let selectedField;

  if (selection) {
    const { schemaPath } = fields.get(selection);

    // The information we need is both in the schema and in the field registration

    // Having a properly imported and maintained structure (with $parent relationships) would allow us
    // to get the up-to-date path at any point
    selectedField = {
      ...get(schema, schemaPath),
      schemaPath
    };
  }

  const dragAndDropContext = {
    drake
  };

  useEffect(() => {
    drake.on('drop', (el, target, source, sibling) => {
      drake.remove();

      if (!target) {
        return;
      }

      const targetField = fields.get(target.dataset.id);

      const siblingField = sibling && fields.get(sibling.dataset.id),
            targetIndex = siblingField ? getFieldIndex(targetField, siblingField) : targetField.components.length;

      if (source.classList.contains('palette')) {
        const type = el.dataset.fieldType;

        const fieldRenderer = getFieldRenderer(type);

        const field = fieldRenderer.create({
          parent: targetField.id
        });

        addField(targetField, targetIndex, field);
      } else {
        const field = fields.get(el.dataset.id),
              sourceField = fields.get(source.dataset.id),
              sourceIndex = getFieldIndex(sourceField, field);

        moveField(sourceField, targetField, sourceIndex, targetIndex);
      }
    });
  }, []);

  const selectionContext = {
    selection,
    setSelection
  };

  const formRenderContext = {
    Children,
    Element,
    Empty
  };

  const formContext = {
    fields,
    getFieldRenderer,
    properties: {
      readOnly: true
    },
    schema,
    data: {},
    errors: {}
  };

  const onSubmit = useCallback((event) => {
    event.preventDefault();
  }, []);

  const onReset = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <div class="fjs-editor">

      <DragAndDropContext.Provider value={ dragAndDropContext }>
        <div class="palette-container">
          <Palette fieldRenderers={ fieldRenderers } />
        </div>
        <div class="form-container">

          <FormContext.Provider value={ formContext }>
            <FormRenderContext.Provider value={ formRenderContext }>
              <SelectionContext.Provider value={ selectionContext }>
                <Form schema={ schema } onSubmit={ onSubmit } onReset={ onReset } />
              </SelectionContext.Provider>
            </FormRenderContext.Provider>
          </FormContext.Provider>

        </div>
      </DragAndDropContext.Provider>

      <div class="properties-container">
        <PropertiesPanel field={ selectedField } editField={ editField }/>
      </div>
    </div>
  );
}

function getFieldIndex(targetField, field) {
  let targetIndex = targetField.components.length;

  targetField.components.forEach(({ id }, index) => {
    if (id === field.id) {
      targetIndex = index;
    }
  });

  return targetIndex;
}

// TODO(philippfromme): add get function to min-dash
function get(target, path, defaultValue) {
  function _get(target, path) {
    var index = 0,
        length = path.length;

    while (target != null && index < length) {
      target = target[ path[ index++ ] ];
    }

    return (index && index == length) ? target : undefined;
  }

  var result = target == null ? undefined : _get(target, path);

  return result === undefined ? defaultValue : result;
}