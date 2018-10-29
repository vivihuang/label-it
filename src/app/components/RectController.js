import * as React from 'react';
import {isEmpty} from 'ramda';
import {DraggableCore} from 'react-draggable'

class RectController extends React.Component {
  constructor(props) {
    super(props);
    this.dragging = [];
  }

  _onStart = (e) => {
    this.origin = [e.pageX, e.pageY];
  }

  _onStop = (e) => {
    this.origin = [];
    this.props.onStop(e);
  }

  _onDrag = (e) => {
    if (isEmpty(this.origin)) return;

    this.props.onDrag(e.pageX - this.origin[0], e.pageY - this.origin[1]);
  }

  render() {
    const {point, size = 12} = this.props;
    return (
      <DraggableCore
        onStart={this._onStart}
        onStop={this._onStop}
        onDrag={this._onDrag}
      >
        <rect
          x={point[0] - size/2}
          y={point[1] - size/2}
          width={size}
          height={size}
        />
      </DraggableCore>
    );
  }
}

export default RectController
