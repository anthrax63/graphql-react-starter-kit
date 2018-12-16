import React, {PropTypes} from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import EditIcon from 'material-ui/svg-icons/image/edit';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Table.css';
import dot from 'dot-object';


const getCellText = (column, item) => {
  if (column.cellText) {
    if (typeof column.cellText === 'function') {
      return column.cellText(item);
    } else {
      return column.cellText;
    }
  } else if (column.name) {
    return dot.pick(column.name, item);
  } else {
    return '';
  }
};


class TableComponent extends React.Component {
  static propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      cellText: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
      label: PropTypes.string
    })),
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    isRowEditable: PropTypes.bool,
    isRowSelectable: PropTypes.bool,
    stripedRows: PropTypes.bool,
    canSelectItem: PropTypes.func,
    itemIsSelected: PropTypes.func,
    onItemEditRequested: PropTypes.func,
    onItemsSelected: PropTypes.func
  };

  static defaultProps = {
    stripedRows: true
  };

  handleRowSelection = (rows) => {
    let selectedItems;
    let {items, onItemsSelected} = this.props;
    if (rows === 'none') {
      selectedItems = [];
    } else if (rows === 'all') {
      selectedItems = items.filter(this.itemCanBeSelected).map((_, i) => i);
    } else {
      selectedItems = rows;
    }
    if (onItemsSelected) {
      onItemsSelected(selectedItems);
    }
  };

  handleEditButtonTouchTap = (item) => {
    let {onItemEditRequested} = this.props;
    return () => {
      if (onItemEditRequested) {
        onItemEditRequested(item);
      }
    };
  };

  itemCanBeSelected = (item) => {
    const {canSelectItem, isRowSelectable} = this.props;
    const selectable = !!isRowSelectable;
    return selectable ? (canSelectItem ? canSelectItem(item) : true) : false;
  };

  render() {
    const {columns, items, isRowEditable, isRowSelectable, stripedRows, itemIsSelected} = this.props;
    const {handleEditButtonTouchTap, handleRowSelection, itemCanBeSelected} = this;
    const selectable = !!isRowSelectable;
    return (
      <div>
        <Table onRowSelection={handleRowSelection} multiSelectable={selectable} fixedHeader={false}
               style={{tableLayout: 'auto', marginBottom: 80}}
               selectable={selectable}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={selectable}>
            <TableRow>
              {columns.map((c, i) => {
                return <TableHeaderColumn key={`column${i}`}>{c.label}</TableHeaderColumn>;
              })}
              {isRowEditable ? (<TableHeaderColumn>{''}</TableHeaderColumn>) : null}
            </TableRow>
          </TableHeader>
          <TableBody stripedRows={stripedRows} displayRowCheckbox={selectable}>
            {items.map((item, i) => {
              return (
                <TableRow key={i} selectable={itemCanBeSelected(item)} selected={itemIsSelected && itemIsSelected(item)}
                          className={itemCanBeSelected(item) ? null : s.hideCheckbox}>
                  {columns.map((c, j) => {
                    return <TableRowColumn key={`columnRow${i}_${j}`}
                                           style={{
                                             overflow: 'hidden',
                                             whiteSpace: 'pre-wrap'
                                           }}>{getCellText(c, item)}</TableRowColumn>;
                  })}
                  {isRowEditable ?
                    (
                      <TableRowColumn style={{width: 50, minWidth: 50}}>
                        <div onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}>
                          <IconButton onTouchTap={handleEditButtonTouchTap(item)}>
                            <EditIcon/>
                          </IconButton>
                        </div>
                      </TableRowColumn>
                    ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default (withStyles(s)(TableComponent));
