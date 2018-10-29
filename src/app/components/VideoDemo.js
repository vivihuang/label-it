import React from 'react';
import {isEmpty, map, addIndex} from 'ramda';

export default class VideoDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoUrl: null,
      segments: [],
      recording: false
    };
    this._video = React.createRef();
  }

  _onSelectFile = (e) => {
    this.setState({
      videoUrl: URL.createObjectURL(e.target.files[0])
    });
  }

  _onStartRecord = (e) => {
    this.setState({
      segments: [...this.state.segments, [this._video.current.currentTime, this._video.current.duration]],
      recording: true
    });
  }

  _onStopRecord = (e) => {
    const [startTime] = this.state.segments.pop();
    this.setState({
      segments: [...this.state.segments, [startTime, this._video.current.currentTime]],
      recording: false
    });
  }

  _onUpdateTime = (e, index, isStart) => {
    const {segments} = this.state;
    this.setState({
      segments: [
        ...segments.slice(0, index),
        isStart ? [parseFloat(e.target.value), segments[index][1]] : [segments[index][0], parseFloat(e.target.value)],
        ...segments.slice(index + 1)
      ]
    });
  }

  _onPreview = (e) => {
    const {segments} = this.state;
    let index = 0;
    this._video.current.currentTime = segments[index][0];
    this._video.current.play();
    function seekWhenTimeUpdated (e) {
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
    }
    this._video.current.addEventListener('timeupdate', seekWhenTimeUpdated);
  }

  render() {
    const {videoUrl, segments, recording} = this.state;
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
          <input type="file" onChange={this._onSelectFile} />
          {
            recording ? <button onClick={this._onStopRecord}>Stop Record</button> : <button onClick={this._onStartRecord}>Start Record</button>
          }
          <button style={{
            marginLeft: 20
          }} onClick={this._onPreview}>Preview</button>
        </div>
        {
          videoUrl && <video width="1280" height="720" ref={this._video} controls>
            <source src={videoUrl} type="video/mp4" />
          </video>
        }
        {
          addIndex(map)(([startTime, endTime], index) => <div>
            [{index}]
            <input type="text" value={startTime} onChange={(e) => this._onUpdateTime(e, index, true)}/>
            <input type="text" value={endTime} onChange={(e) => this._onUpdateTime(e, index, false)}/>
          </div>, segments)
        }
      </div>
    );
  }
}