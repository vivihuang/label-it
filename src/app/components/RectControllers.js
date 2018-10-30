import * as React from 'react';
import {mapObjIndexed, values, equals} from 'ramda';
import RectController from './RectController';
import {normalize, getCornerPoint, getDiagonalPoint, CENTER} from '../../util/rect';
import {
  getControllersPoints
} from '../../util/rect'

class RectControllers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shape: [...this.props.shape]
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equals(this.props.shape, nextProps.shape)) {
      this.setState({
        shape: nextProps.shape
      });
    }
  }

  _onDrag = (corner, offsetX, offsetY) => {
    const oldShape = this.props.shape;
    let newShape = [...oldShape];
    if (corner === CENTER) {
      newShape[0] += offsetX;
      newShape[1] += offsetY;
    } else {
      const cornerPoints = getCornerPoint(oldShape, corner);
      const diagonalPoints = getDiagonalPoint(oldShape, corner);
      newShape = normalize(cornerPoints[0] + offsetX, cornerPoints[1] + offsetY, ...diagonalPoints);
    }

    this.setState({
      shape: newShape
    });
  }

  render() {
    const {style} = this.props;
    const {shape} = this.state;
    const points = getControllersPoints(shape);

    return (
      <g>
        <rect
          x={shape[0]}
          y={shape[1]}
          width={shape[2]}
          height={shape[3]}
          style={{
            ...style,
            fill: 'none',
            strokeWidth: 3,
            stroke: 'red'
          }}
        />,
        <g fill="white" stroke="#333" strokeWidth="1">
          {
            values(mapObjIndexed((point, position) =>
              <RectController
                key={position}
                point={point}
                onDrag={(...args) => this._onDrag(position, ...args)}
                onStop={() => this.props.onUpdateShape(this.state.shape)}
              />, points))
          }
        </g>
      </g>
    );
  }
}

export default RectControllers;
