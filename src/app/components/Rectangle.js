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
          fill: 'rgb(0,0,255)',
          strokeWidth: 3,
          stroke: 'rgb(0, 0, 0)'
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
