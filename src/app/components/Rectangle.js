import * as React from 'react';
import RectControllers from './RectControllers';


const Rectangle = ({shape, style, onUpdateShape, editMode = false}) => {
  return (
    <g>
      { !editMode && <rect
        x={shape[0]}
        y={shape[1]}
        width={shape[2]}
        height={shape[3]}
        style={{
          ...style,
          fill: 'none',
          strokeWidth: 3,
          stroke: 'red'
        }} />
      }
      {
        editMode && <RectControllers
          shape={shape}
          onUpdateShape={onUpdateShape}
          />
      }
    </g>
  );
}

export default Rectangle;
