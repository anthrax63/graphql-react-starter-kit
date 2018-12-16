import React, {PropTypes} from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import ArrowForward from 'material-ui/svg-icons/navigation/arrow-forward';
import {injectIntl, intlShape} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Pagination.css';

class Pagination extends React.Component {
  static propTypes = {
    intl: intlShape,
    totalCount: PropTypes.number.isRequired,
    skip: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
    maxPagesCount: PropTypes.number,
    onUpdate: PropTypes.func
  };

  update = (skip, limit) => {
    let {onUpdate} = this.props;
    if (onUpdate) {
      onUpdate({skip, limit});
    }
  };

  handlePageButtonClick = (e, skip) => {
    let {limit} = this.props;
    this.update(skip, limit);
  };

  handleBackwardButtonClick = () => {
    let {skip, limit} = this.props;
    this.update(Math.max(0, skip - limit), limit);
  };

  handleForwardButtonClick = () => {
    let {skip, limit, totalCount} = this.props;
    this.update(Math.min(totalCount, skip + limit), limit);
  };

  createPageButton = (key, pageIndex, isDisabled) => {
    let {limit} = this.props;
    return (
      <FloatingActionButton
        key={key}
        disabled={isDisabled}
        className={s.button}
        mini={true}
        onTouchTap={(e) => this.handlePageButtonClick(e, pageIndex * limit)}
      >
        <span>{pageIndex + 1}</span>
      </FloatingActionButton>
    );
  };

  createDotDivider = (key) => {
    return (
      <span key={key} className={s.dotDivider}>...</span>
    );
  };

  createArrowButton = (key, children, isDisabled, eventHandler) => {
    return (
      <FloatingActionButton
        key={key}
        className={s.button}
        mini={true}
        disabled={isDisabled}
        onTouchTap={eventHandler}
      >
        {children}
      </FloatingActionButton>
    );
  };

  createBackwardButton = (key, isDisabled) => {
    return this.createArrowButton(key, <ArrowBack/>, isDisabled, this.handleBackwardButtonClick);
  };

  createForwardButton = (key, isDisabled) => {
    return this.createArrowButton(key, <ArrowForward/>, isDisabled, this.handleForwardButtonClick);
  };

  getButtons = () => {
    const {totalCount, skip, limit, maxPagesCount} = this.props;
    const {createPageButton, createDotDivider, createForwardButton, createBackwardButton} = this;
    const pagesCount = Math.ceil(totalCount / limit);
    const currentPage = Math.trunc(skip / limit);
    const buttonsCount = Math.min(maxPagesCount || 6, pagesCount);
    const firstButton = Math.max(0, currentPage - Math.trunc(buttonsCount / 2));
    const lastButton = Math.min(firstButton + buttonsCount - 1, pagesCount - 1);

    let nodes = [];
    if (firstButton > 0) {
      nodes.push(createPageButton(`button${nodes.length}`, 0, false));
      nodes.push(createDotDivider(`button${nodes.length}`));
    }
    for (let i = firstButton; i <= lastButton; i++) {
      nodes.push(createPageButton(`button${nodes.length}`, i, i === currentPage));
    }
    if (lastButton < pagesCount - 1) {
      nodes.push(createDotDivider(`button${nodes.length}`));
      nodes.push(createPageButton(`button${nodes.length}`, pagesCount - 1, false));
    }
    nodes.push(<span key={`button${nodes.length}`} className={s.emptyDivider}>&nbsp;</span>);
    nodes.push(createBackwardButton(`button${nodes.length}`, currentPage === 0));
    nodes.push(createForwardButton(`button${nodes.length}`, currentPage >= pagesCount - 1));
    return nodes;
  };

  render() {
    const {totalCount, skip, limit} = this.props;
    const {getButtons} = this;
    return (
      <div>
        <div className={s.container}>
          <div className={s.label}>
            {skip + 1}-{Math.min(skip + limit, totalCount)}/{totalCount}
          </div>
          <div className={s.buttons}>
            {getButtons()}
          </div>
        </div>
      </div>
    );
  }
}

export const PaginationComponent = Pagination;

export default (withStyles(s)(injectIntl(Pagination)));
