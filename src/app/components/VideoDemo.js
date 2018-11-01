import React from 'react';
import { map, addIndex, findIndex, propEq } from 'ramda';
import Rectangle from './Rectangle';
import { normalize } from '../../util/rect';
import uuid from 'uuid';

const videoStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  margin: '20px 40px',
};

export default class VideoDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoUrl: null,
      segments: [],
      recording: false,
      drawMode: false,
      editMode: false,
      width: 0,
      height: 0,
      living: {
        type: 'RECTANGLE',
      },
      layers: [],
    };
    this._video = React.createRef();
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

  _dataLoaded = () => {
    const width = this._video && this._video.current ? this._video.current.clientWidth : 0;
    const height = this._video && this._video.current ? this._video.current.clientHeight : 0;
    this.setState({
      width,
      height,
    });
  };

  _onSelectFile = (e) => {
    this.setState({
      videoUrl: URL.createObjectURL(e.target.files[0]),
    });
  };

  _onStartRecord = (e) => {
    this.setState({
      segments: [...this.state.segments, [this._video.current.currentTime, this._video.current.duration]],
      recording: true,
    });
  };

  _onStopRecord = (e) => {
    const [startTime] = this.state.segments.pop();
    this.setState({
      segments: [...this.state.segments, [startTime, this._video.current.currentTime]],
      recording: false,
    });
  };

  _onUpdateTime = (e, index, isStart) => {
    const { segments } = this.state;
    this.setState({
      segments: [
        ...segments.slice(0, index),
        isStart ? [parseFloat(e.target.value), segments[index][1]] : [segments[index][0], parseFloat(e.target.value)],
        ...segments.slice(index + 1),
      ],
    });
  };

  _onPreview = (e) => {
    const { segments } = this.state;
    let index = 0;
    this._video.current.currentTime = segments[index][0];
    this._video.current.play();

    function seekWhenTimeUpdated(e) {
      if (e.target.currentTime >= segments[index][1]) {
        index += 1;
        if (index >= segments.length) {
          e.target.pause();
          removeListener();
        } else {
          e.target.currentTime = segments[index][0];
        }
      }
    }

    const removeListener = () => {
      this._video.current.removeEventListener('timeupdate', seekWhenTimeUpdated);
    };
    this._video.current.addEventListener('timeupdate', seekWhenTimeUpdated);
  };

  _getCursorPos = (e) => {
    const svgRects = this._svg.current.getClientRects()[0];
    return [e.clientX - svgRects.x, e.clientY - svgRects.y];
  };

  _onMouseDown = (e) => {
    if (this.state.editMode) return;
    if (this.state.drawMode) {
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

    if (this.state.drawMode) {
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

    if (this.state.drawMode) {
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
    const { videoUrl, segments, recording, width, height } = this.state;
    return (
      <div>
        <div>
          <ol>
            <li>选择一个视频文件，并开始播放</li>
            <li>点击 start record 开始截取，再次点击停止截取，可循环选择</li>
            <li>点击 preview 开始预览</li>
          </ol>
        </div>
        <div>
          <input type="file" onChange={this._onSelectFile}/>
          {videoUrl && (
            <div>
              {
                recording ? <button onClick={this._onStopRecord}>Stop Record</button> :
                  <button onClick={this._onStartRecord}>Start Record</button>
              }
              <button style={{
                marginLeft: 20,
              }} onClick={this._onPreview}>Preview
              </button>
              <input type="checkbox" name="drawable" onChange={this._onDrawChange}/> draw mode
              <input type="checkbox" name="editable" onChange={this._onEditChange}/> edit mode
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          {
            videoUrl &&
            <video ref={this._video} controls style={{ margin: '20px 40px' }} onLoadedData={this._dataLoaded}>
              <source src={videoUrl} type="video/mp4"/>
            </video>
          }
          {
            videoUrl &&
            <svg
              width={width}
              height={height}
              style={videoStyle}
              onMouseDown={this._onMouseDown}
              onMouseUp={this._onMouseUp}
              onMouseMove={this._onMouseMove}
              ref={this._svg}>
              >
              {
                map((s) => <Rectangle
                  shape={s.shape}
                  key={s.id}
                  editMode={this.state.editMode}
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
          }
        </div>
        {
          addIndex(map)(([startTime, endTime], index) => <div key={index}>
            [{index}]
            <input type="text" value={startTime} onChange={(e) => this._onUpdateTime(e, index, true)}/>
            <input type="text" value={endTime} onChange={(e) => this._onUpdateTime(e, index, false)}/>
          </div>, segments)
        }
      </div>
    );
  }
}