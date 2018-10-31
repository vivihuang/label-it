import * as React from 'react';
import Rectangle from './Rectangle';
import { map, findIndex, propEq } from 'ramda';
import { normalize, getCornerPoint, getDiagonalPoint, CENTER } from '../../util/rect';
import uuid from 'uuid';

const MAX_SCALE = 2;
const MIN_SCALE = 0.5;

export default class LabelDemo extends React.Component {
  constructor() {
    super();
    this.state = {
      image: {
        x: 0,
        y: 0,
      },
      file: '',
      width: 0,
      height: 0,
      scale: 1,
      living: {
        type: 'RECTANGLE',
      },
      layers: [],
      editMode: false,
      preLabelURL: 'http://twdp-saledemo:40022/detect',
      drawMode: false,
      dragMode: false,
      startPos: {
        x: '',
        y: '',
      },
      imageStartPos: {
        x: '',
        y: '',
      },
    };

    this.points = [];

    this._svg = React.createRef();
  }

  _onEditChange = (e) => {
    this.setState({
      editMode: e.target.checked,
    });
  };

  _onDrawChange = (e) => {
    this.setState({
      drawMode: e.target.checked,
    });
  };

  _onSelectFile = (e) => {
    const img = new Image();
    const file = URL.createObjectURL(e.target.files[0]);
    this.setState({
      imageFile: e.target.files[0],
    });

    img.src = file;
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      this.setState({
        file,
        width,
        height,
      });
    };
  };

  _calcWheelPos(e, ratio = 1) {
    const { x, y } = this.state.image;
    const svgRects = this._svg.current.getClientRects()[0];
    const cursorX = e.pageX - svgRects.x - x;
    const cursorY = e.pageY - svgRects.y - y;

    return {
      x: x + (cursorX - x) * ratio,
      y: y + (cursorY - y) * ratio,
    };
  }

  _calcDragPos(cursorPos) {
    return {
      x: this.state.imageStartPos.x + cursorPos[0] - this.state.startPos.x,
      y: this.state.imageStartPos.y + cursorPos[1] - this.state.startPos.y,
    }
  }

  _getCursorPos(e) {
    const svgRects = this._svg.current.getClientRects()[0];
    return [e.pageX - svgRects.x, e.pageY - svgRects.y];
  }

  _onWheel = (e) => {
    if (!this.state.drawMode) {
      let scale = this.state.scale;

      if (e.deltaY < 0) {
        scale += 0.03;
      } else if (e.deltaY > 0) {
        scale -= 0.03;
      }

      if (scale > MAX_SCALE) scale = MAX_SCALE;
      else if (scale < MIN_SCALE) scale = MIN_SCALE;

      const ratio = 1 - scale / this.state.scale;

      this.setState({
        scale,
        image: this._calcWheelPos(e, ratio),
      });
    }
  };

  _onMouseDown = (e) => {
    if (this.state.editMode) return;
    const cursorPos = this._getCursorPos(e);
    if (this.state.drawMode) {
      this.setState({
        living: {
          ...this.state.living,
          points: [...cursorPos, ...cursorPos],
        },
      });
    } else {
      this.setState({
        dragMode: true,
        startPos: {
          x: cursorPos[0],
          y: cursorPos[1],
        },
        imageStartPos: {
          x: this.state.image.x,
          y: this.state.image.y,
        },
      });
    }
  };

  _onMouseMove = (e) => {
    if (!this.state.living.points && this.state.drawMode) return;

    const cursorPos = this._getCursorPos(e);
    if (this.state.drawMode) {
      const startPos = this.state.living.points.slice(0, 2);
      this.setState({
        living: {
          ...this.state.living,
          points: [...startPos, ...cursorPos],
        },
      });
    } else if (this.state.dragMode) {
      this.setState({
        image: this._calcDragPos(cursorPos),
      });
    }
  };

  _onMouseUp = (e) => {
    if (!this.state.living.points && this.state.drawMode) return;

    const cursorPos = this._getCursorPos(e);
    if (this.state.drawMode) {
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
    } else {
      this.setState({
        dragMode: false,
        image: this._calcDragPos(cursorPos),
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

  _onPreLabel = () => {
    const { imageFile } = this.state;
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      fetch(this.state.preLabelURL, {
        method: 'POST',
        body: formData,
        mode: "cors",
      }).then(res => res.json())
        .then(response => this._updatePreLabeledBoxes(response));
    }
  };

  _updatePreLabeledBoxes = (boxesArray) => {
    const boxes = boxesArray.map(box => {
      return {
        id: uuid(),
        type: 'RECTANGLE',
        shape: box,
      };
    });
    this.setState({
      layers: this.state.layers.concat(boxes),
    });
  };

  render() {
    const { file, width, height, scale, image } = this.state;
    return (
      <div>
        <div>
          <ol>
            <li>点击下方空白区域，拖动绘制矩形</li>
            <li>勾选edit mode可编辑已创建的矩形</li>
          </ol>
        </div>
        <div>
          <input type="file" onChange={this._onSelectFile}/>
          <button onClick={this._onPreLabel}>Pre-label</button>
          <input type="checkbox" name="drawable" onChange={this._onDrawChange}/> draw mode
          <input type="checkbox" name="editable" onChange={this._onEditChange}/> edit mode
        </div>
        <svg
          width={width}
          height={height}
          style={{ margin: '20px 40px', border: '1px solid #000' }}
          onWheel={this._onWheel}
          onMouseDown={this._onMouseDown}
          onMouseUp={this._onMouseUp}
          onMouseMove={this._onMouseMove}
          ref={this._svg}>
          <image xlinkHref={file} height={height * scale} width={width * scale} x={image.x} y={image.y}/>
          {
            map((s) => <Rectangle
              shape={s.shape}
              key={s.id}
              editMode={this.state.editMode}
              onUpdateShape={(...args) => this._onUpdateShape(s.id, ...args)}
            />, this.state.layers)
          }
          {
            this.state.living.type === 'RECTANGLE'
            && this.state.living.points
            && <Rectangle shape={normalize(...this.state.living.points)}/>
          }
        </svg>
      </div>
    );
  }
}
