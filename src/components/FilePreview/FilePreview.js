import React, {Component, PropTypes} from 'react';
import ReactPlayer from 'react-player';


const imgStyle = {
  zoom: 2,
  display: 'block',
  margin: 'auto',
  height: 'auto',
  maxHeight: '100%',
  width: 'auto',
  maxWidth: '100%'
};

const videoStyle = {
  display: 'block',
  width: 100,
  height: 100
};

export default class FilePreview extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number
  };

  renderPreview = () => {
    const {name, link} = this.props;
    const width = this.props.width || 100;
    const height = this.props.height || 100;
    if (/(jpg|jpeg|png|gif)$/.test(name)) {
      return <img style={imgStyle} src={link}/>;
    } else if (/(mp4)$/.test(name)) {
      return <ReactPlayer url={link}
                          style={videoStyle}
                          width={width}
                          height={height}
                          playing={true}
                          loop={true}
                          volume={0}
      />;
    } else {
      return <span>Загружено</span>;
    }
  };


  render() {
    return this.renderPreview();
  }
}
