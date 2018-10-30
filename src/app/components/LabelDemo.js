import * as React from 'react';
import Rectangle from './Rectangle';
import {map, findIndex, propEq} from 'ramda';
import {normalize, getCornerPoint, getDiagonalPoint, CENTER} from '../../util/rect';
import uuid from 'uuid';

const MAX_SCALE = 2;
const MIN_SCALE = 0.5;

export default class LabelDemo extends React.Component {
  constructor() {
    super();
    this.state = {
      image: {
        x: 0,
        y: 0
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
      preLabelURL: 'http://localhost:40022/detect'
    };

    this.points = [];

    this._svg = React.createRef();
  }

  _onEditChange = (e) => {
    this.setState({
      editMode: e.target.checked
    });
  }

  _onSelectFile = (e) => {
    const img = new Image();
    const file = URL.createObjectURL(e.target.files[0]);
    this.setState({
      imageFile: e.target.files[0]
    });

    img.src = file;
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      this.setState({
        file,
        width,
        height
      });
    };
  }

  _calcPos(e, scale, {x, y}) {
    const svgRects = this._svg.current.getClientRects()[0];
    const ratio = 1 - scale / this.state.scale;
    const cursorX = e.pageX - svgRects.x - x;
    const cursorY = e.pageY - svgRects.y - y;

    return {
      x: x + (cursorX - x) * ratio,
      y: y + (cursorY - y) * ratio
    }
  }

  _getCursorPos(e) {
    const svgRects = this._svg.current.getClientRects()[0];
    return [e.pageX - svgRects.x, e.pageY - svgRects.y]
  }

  _onWheel = (e) => {
    let scale = this.state.scale;

    if (e.deltaY > 0) {
      scale += 0.03;
    } else if (e.deltaY < 0) {
      scale -= 0.03;
    }

    if (scale > MAX_SCALE) scale = MAX_SCALE
    else if (scale < MIN_SCALE) scale = MIN_SCALE

    this.setState({
      scale,
      image: this._calcPos(e, scale, this.state.image)
    });
  }

  _onMouseDown = (e) => {
    if (this.state.editMode) return;

    this.setState({
      living: {
        ...this.state.living,
        points: [...this._getCursorPos(e), ...this._getCursorPos(e)]
      }
    });
  }

  _onMouseMove = (e) => {
    if (!this.state.living.points) return;

    const cursorPos = this._getCursorPos(e);
    const startPos = this.state.living.points.slice(0, 2);
    this.setState({
      living: {
        ...this.state.living,
        points: [...startPos, ...cursorPos]
      }
    })
  }

  _onMouseUp = (e) => {
    if (!this.state.living.points) return;

    const cursorPos = this._getCursorPos(e);
    const startPos = this.state.living.points.slice(0, 2);
    const livingObject = {
      type: this.state.living.type,
      id: uuid(),
      shape: normalize(...startPos, ...cursorPos)
    };

    this.setState({
      living: {
        type: 'RECTANGLE',
      },
      layers: [...this.state.layers, livingObject]
    })
  }

  _onUpdateShape = (id, shape) => {
    const index = findIndex(propEq('id', id), this.state.layers);

    this.setState({
      layers: [
        ...this.state.layers.slice(0, index),
        {
          ...this.state.layers[index],
          shape
        },
        ...this.state.layers.slice(index + 1)
      ]
    })
  }

  _onPreLabel = () => {
    const formData = new FormData();
    formData.append('image', this.state.imageFile);
    fetch(this.state.preLabelURL, {
      method: 'POST',
      body: formData,
      mode: "cors"
    }).then(res => res.json())
        .then(response => this._updatePreLabeledBoxes(response));
  }

  _updatePreLabeledBoxes = (boxesArray) => {
    console.log(boxesArray[0])
    const boxes = boxesArray.map(box => {
      return {
        id: uuid(),
        type: 'RECTANGLE',
        shape: box
      }
    })
    this.setState({
      layers: this.state.layers.concat(boxes)
    })
  }

  render() {
    const {file, width, height, scale, image} = this.state;
    return (
      <div>
        <div>
          <ol>
            <li>点击下方空白区域，拖动绘制矩形</li>
            <li>勾选edit mode可编辑已创建的矩形</li>
          </ol>
        </div>
        <div>
          <input type="file" onChange={this._onSelectFile} />
          <button onClick={this._onPreLabel}>Pre-label</button>
          <input type="checkbox" name="editable" onChange={this._onEditChange}/> edit mode
        </div>
        <svg
          width="960"
          height="720"
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
              && <Rectangle shape={normalize(...this.state.living.points)} />
          }
        </svg>
      </div>
    );
  }
}
