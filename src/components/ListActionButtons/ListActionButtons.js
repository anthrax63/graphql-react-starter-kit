import React, {PropTypes} from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAddIcon from 'material-ui/svg-icons/content/add';
import ContentDeleteIcon from 'material-ui/svg-icons/action/delete';
import Badge from 'material-ui/Badge';
import {injectIntl, intlShape} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ListActionButtons.css';

class ListActionButtons extends React.Component {
  static propTypes = {
    intl: intlShape,
    isAddButtonVisible: PropTypes.bool,
    isRemoveButtonVisible: PropTypes.bool,
    countToRemove: PropTypes.number,
    onAddButtonClicked: PropTypes.func,
    onRemoveButtonClicked: PropTypes.func
  };

  handleAddButtonTouchTap = () => {
    if (this.props.onAddButtonClicked) {
      this.props.onAddButtonClicked();
    }
  };

  handleRemoveButtonTouchTap = () => {
    if (this.props.onRemoveButtonClicked) {
      this.props.onRemoveButtonClicked();
    }
  };

  render() {
    const {countToRemove, isAddButtonVisible, isRemoveButtonVisible} = this.props;
    const {handleAddButtonTouchTap, handleRemoveButtonTouchTap} = this;
    return (
      <div className={s.buttonsPanel}>
        {
          (
            <div id="mydiv" className={isRemoveButtonVisible ? s.activeButtonContainer : s.buttonContainer}>
              <Badge
                badgeContent={countToRemove}
                secondary={true}
                badgeStyle={{top: 14, right: 14}}
              >
                <FloatingActionButton className={s.button} secondary={true} onTouchTap={handleRemoveButtonTouchTap}>
                  <ContentDeleteIcon />
                </FloatingActionButton>
              </Badge>
            </div>
            )
        }
        {
          isAddButtonVisible ? (
              <Badge
                badgeContent={''}
                primary={true}
                badgeStyle={{top: 14, left: 50, opacity: 0, padding: 0}}
              >
                <FloatingActionButton className={s.button} onTouchTap={handleAddButtonTouchTap}>
                  <ContentAddIcon />
                </FloatingActionButton>
              </Badge>
            ) :
            (<div/>)
        }
      </div>
    );
  }
}

export const ListActionButtonsComponent = ListActionButtons;

export default (withStyles(s)(injectIntl(ListActionButtons)));
