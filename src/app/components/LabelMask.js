import React, { Component, createRef } from 'react';
import { findIndex, map, propEq } from 'ramda';
import uuid from 'uuid';

import Rectangle from './Rectangle';
import { normalize } from '../../util/rect';

export default class LabelMask extends Component {
  _svg = createRef();

  state = {
    living: {
      type: 'RECTANGLE',
    },
    layers: [],
  };

  _getCursorPos = (e) => {
    const svgRects = this._svg.current.getClientRects()[0];
    return [e.clientX - svgRects.x, e.clientY - svgRects.y];
  };

  _onMouseDown = (e) => {
    if (this.props.editMode) return;
    if (this.props.drawMode) {
      this.props.onMouseDown();
      const cursorPos = this._getCursorPos(e);
      this.setState({
        living: {
          ...this.state.living,
          points: [...cursorPos, ...cursorPos],
        },
      });
    }
  };

  _onMouseMove = (e) => {
    if (!this.state.living.points) return;

    if (this.props.drawMode) {
      const cursorPos = this._getCursorPos(e);
      const startPos = this.state.living.points.slice(0, 2);
      this.setState({
        living: {
          ...this.state.living,
          points: [...startPos, ...cursorPos],
        },
      });
    }
  };

  _onMouseUp = (e) => {
    if (!this.state.living.points) return;

    if (this.props.drawMode) {
      const cursorPos = this._getCursorPos(e);
      const startPos = this.state.living.points.slice(0, 2);
      const livingObject = {
        type: this.state.living.type,
        id: uuid(),
        shape: normalize(...startPos, ...cursorPos),
      };

      this.setState({
        living: {
          type: 'RECTANGLE',
        },
        layers: [...this.state.layers, livingObject],
      });
    }
  };

  _onUpdateShape = (id, shape) => {
    const index = findIndex(propEq('id', id), this.state.layers);

    this.setState({
      layers: [
        ...this.state.layers.slice(0, index),
        {
          ...this.state.layers[index],
          shape,
        },
        ...this.state.layers.slice(index + 1),
      ],
    });
  };

  render() {
    const { width = 0, height = 0, editMode, customStyle = {} } = this.props;
    return (
      <svg
        width={width}
        height={height}
        style={customStyle}
        onMouseDown={this._onMouseDown}
        onMouseUp={this._onMouseUp}
        onMouseMove={this._onMouseMove}
        ref={this._svg}>
        >
        {
          map((s) => <Rectangle
            shape={s.shape}
            key={s.id}
            editMode={editMode}
            onUpdateShape={(...args) => this._onUpdateShape(s.id, ...args)}
          />, this.state.layers)
        }
        {
          this.state.living
          && this.state.living.type === 'RECTANGLE'
          && this.state.living.points
          && <Rectangle shape={normalize(...this.state.living.points)}/>
        }
      </svg>
    );
  }
}
