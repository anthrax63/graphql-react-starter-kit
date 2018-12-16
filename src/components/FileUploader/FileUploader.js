import React, {Component, PropTypes} from 'react';
import DropZone from 'react-dropzone';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import CircularProgress from 'material-ui/CircularProgress';
import FilePreview from '../FilePreview';
import s from './FileUploader.css';

const messages = defineMessages({
  dropLabel: {
    id: 'fileUploader.dropLabel',
    defaultMessage: 'Drop file here or click to open file using dialog',
    description: 'File uploader drop zone label'
  }
});

const sizeStyle = {
  width: 100,
  height: 100,
  maxWidth: 100,
  maxHeight: 100
};

const style = {
  ...sizeStyle,
  borderColor: 'gray',
  borderRadius: 4,
  borderStyle: 'dashed',
  borderWidth: 2,
  marginTop: 4,
  padding: 4,
  fontSize: 10,
  textAlign: 'center',
  verticalAlign: 'middle',
  display: 'table-cell'
};

const activeStyle = {
  borderColor: 'black'
};


class FileUploader extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  static propTypes = {
    intl: intlShape,
    label: PropTypes.string,
    file: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      ready: PropTypes.bool,
      link: PropTypes.string
    }),
    accept: PropTypes.string,
    onFileReady: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      preview: {}
    };
  }

  renderPreview = () => {
    const {file} = this.props;
    const {preview} = this.state;
    const link = preview.link || file.link || '';
    const fileName = preview.name || file.name || '';
    return <FilePreview name={fileName} link={link} width={sizeStyle.width} height={sizeStyle.height}/>;
  };


  renderFile = () => {
    const {file, intl: {formatMessage}} = this.props;
    const {preview} = this.state;
    const {renderPreview} = this;
    if (file || preview.link) {
      if (preview.link) {
        return renderPreview();
      } else if (file.ready) {
        return renderPreview();
      } else {
        return <CircularProgress size={30}/>;
      }
    } else {
      return formatMessage(messages.dropLabel);
    }
  };


  handleOnDrop = (acceptedFiles) => {
    const {onFileReady} = this.props;
    if (acceptedFiles[0]) {
      const file = acceptedFiles[0];
      if (onFileReady) {
        onFileReady(file);
      }
      this.setState({
        preview: {
          link: file.preview,
          name: file.name
        }
      });
    }
  };

  render() {
    const {renderFile, handleOnDrop} = this;
    const {label, accept} = this.props;
    const {muiTheme} = this.context;
    return (
      <div className={s.container}>
        {label && <label style={{color: muiTheme.rawTheme.palette.disabledColor, fontSize: 14}}>{label}</label>}
        <DropZone multiple={false} accept={accept} onDrop={handleOnDrop} style={style} activeStyle={activeStyle}>
          {renderFile()}
        </DropZone>
      </div>
    );
  }
}

export default injectIntl(FileUploader);
