import React from 'react';
import { map, addIndex } from 'ramda';
import { Player, ControlBar } from 'video-react';

import LabelMask from './LabelMask';
import './video.css';

const videoStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
};

export default class VideoDemo extends React.Component {
  _video = React.createRef();
  timer = null;

  state = {
    videoUrl: null,
    segments: [],
    recording: false,
    drawMode: false,
    editMode: false,
    width: 0,
    height: 0,
  };

  getCurrentPlayer = () => {
    const { player } = this._video.current.getState();
    return player;
  };

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
    const width = this._video && this._video.current ? this._video.current.videoWidth : 0;
    const height = this._video && this._video.current ? this._video.current.videoHeight : 0;
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
    const player = this.getCurrentPlayer();
    this.setState({
      segments: [...this.state.segments, [player.currentTime, player.duration]],
      recording: true,
    });
  };

  _onStopRecord = (e) => {
    const player = this.getCurrentPlayer();
    const [startTime] = this.state.segments.pop();
    this.setState({
      segments: [...this.state.segments, [startTime, player.currentTime]],
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

  _stopPreview = () => {
    this._video.current.pause();
    window.clearInterval(this.timer);
  };

  _onPreview = () => {
    const { segments } = this.state;
    const startTime = segments[0][0];
    const endTime = segments[segments.length - 1][1];

    let index = 0;
    this._video.current.seek(startTime);
    this._video.current.play();

    this.timer = window.setInterval(() => {
      const player = this.getCurrentPlayer();
      if (player.currentTime > endTime) {
        this._stopPreview();
      }
      if (player.currentTime >= segments[index][1]) {
        index += 1;
        if (index >= segments.length) {
          this._stopPreview();
        } else {
          this._video.current.seek(segments[index][0]);
        }
      }
    }, 500);
  };

  render() {
    const { videoUrl, segments, recording, width, height, drawMode, editMode } = this.state;
    const enablePreview = Array.isArray(segments) && segments.length > 0;
    return (
      <div>
        <div>
          <ol>
            <li>选择一个视频文件，并开始播放</li>
            <li>点击 start record 开始截取，再次点击停止截取，可循环选择</li>
            <li>点击 preview 开始预览</li>
            <li>勾选draw mode后可在视频区域拖动绘制矩形</li>
            <li>勾选edit mode可编辑已创建的矩形</li>
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
              }} onClick={this._onPreview} disabled={!enablePreview}>Preview
              </button>
              <input type="checkbox" name="drawable" onChange={this._onDrawChange}/> draw mode
              <input type="checkbox" name="editable" onChange={this._onEditChange}/> edit mode
            </div>
          )}
        </div>
        <div style={{ position: 'relative', margin: '20px 40px 40px' }} data-vjs-player>
          {
            videoUrl &&
            <Player
              ref={this._video}
              src={videoUrl}
              width={width}
              height={height}
              onLoadedData={this._dataLoaded}
              fluid={false}
            >
              <ControlBar autoHide={false}/>
            </Player>
          }
          {videoUrl &&
          <LabelMask width={width} height={height} drawMode={drawMode} editMode={editMode} customStyle={videoStyle}/>}
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