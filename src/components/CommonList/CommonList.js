import React, {PropTypes} from 'react';
import Table from '../../components/Table';
import ListActionButtons from '../../components/ListActionButtons';
import Pagination from '../../components/Pagination';
import FilterPanel from '../../components/FilterPanel';
import {intlShape} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CommonList.css';
import {injectIntl} from 'react-intl';

const createListComponent = ({name, shape, columns, filterFields, editorComponent, stripedRows, editorActions = {}}) => {
  class CommonList extends React.Component {
    static propTypes = {
      intl: intlShape,
      filterData: PropTypes.object,
      values: PropTypes.arrayOf(shape).isRequired,
      totalCount: PropTypes.number.isRequired,
      editItem: PropTypes.object,
      query: PropTypes.shape({
        skip: PropTypes.number,
        limit: PropTypes.number,
        filter: PropTypes.object,
        sort: PropTypes.object
      }),
      fetch: PropTypes.func.isRequired,
      remove: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      editorAdd: PropTypes.func.isRequired,
      editorEdit: PropTypes.func.isRequired,
      editorCancel: PropTypes.func.isRequired
    };

    constructor(props) {
      super(props);
      this.state = {
        selectedItems: []
      };
    }

    handleItemsSelected = async(indexes) => {
      this.setState((state, props) =>
        ({
          ...state,
          selectedItems: indexes.map((i) => props.values[i])
        })
      );
    };

    handleAddButtonClick = async() => {
      const {editorAdd} = this.props;
      editorAdd();
    };

    handleRemoveButtonClick = async() => {
      let {selectedItems} = this.state;
      let {remove, query, fetch} = this.props;
      await remove(selectedItems);
      this.setState((state) =>
        ({
          ...state,
          selectedItems: []
        })
      );
      await fetch(query);
    };

    handleItemEditRequested = async(item) => {
      const {editorEdit} = this.props;
      editorEdit(item.id);
    };

    handleEditorSave = async(values) => {
      const {save, fetch, query} = this.props;
      await save(values);
      await fetch(query);
    };

    handleEditorCancel = async() => {
      const {editorCancel, fetch, query} = this.props;
      await editorCancel();
      await fetch(query);
    };


    handlePaginationUpdate = async({skip, limit}) => {
      let {fetch, query} = this.props;
      let newQuery = {
        ...query,
        skip,
        limit
      };
      fetch(newQuery);
    };

    handleFilterChangeRequested = async(filter) => {
      const {query: {limit}, fetch} = this.props;
      fetch({filter, skip: 0, limit});
    };

    handleCanSelectItem = (item) => {
      return !item.links || item.links.totalCount === undefined || item.links.totalCount === 0;
    };

    handleItemIsSelected = (item) => {
      return this.state.selectedItems.indexOf(item) !== -1;
    };


    translateMessages = (list) => {
      const {formatMessage} = this.props.intl;
      return list.map((item) => {
        const newItem = {...item};
        if (item.label && item.label.id) {
          newItem.label = formatMessage(item.label);
        }
        return newItem;
      });
    };

    render() {
      const {editItem, values, totalCount, query, filterData} = this.props;
      const {selectedItems} = this.state;
      const EditorComponent = editorComponent;
      const {
        handleItemsSelected,
        handleAddButtonClick,
        handleRemoveButtonClick,
        handleItemEditRequested,
        handleEditorSave,
        handleEditorCancel,
        handlePaginationUpdate,
        handleCanSelectItem,
        handleFilterChangeRequested,
        handleItemIsSelected,
        translateMessages
      } = this;
      return (
        <div className={s.root}>
          <div>
            {
              filterFields ?
                <div style={{float: 'left', width: 280, marginRight: 16}}>
                  <FilterPanel
                    filterData={filterData}
                    fields={translateMessages(typeof filterFields === 'function' ? filterFields(this.props) : filterFields)}
                    filter={query.filter || {}}
                    onFilterChangeRequested={handleFilterChangeRequested}
                    expanded={true}
                  />
                </div> :
                null
            }
            <div style={{marginLeft: 296}}>
              <Pagination totalCount={totalCount} skip={query.skip} limit={query.limit} onUpdate={handlePaginationUpdate}/>
              <Table
                columns={typeof columns === 'function' ? translateMessages(columns(this.props)) : translateMessages(columns)}
                items={values}
                isRowEditable={!!editorComponent}
                isRowSelectable={!!editorComponent}
                stripedRows={stripedRows}
                canSelectItem={handleCanSelectItem}
                onItemsSelected={handleItemsSelected}
                onItemEditRequested={handleItemEditRequested}
                itemIsSelected={handleItemIsSelected}
              />
              {
                EditorComponent ?
                  <ListActionButtons
                    isRemoveButtonVisible={selectedItems.length > 0}
                    isAddButtonVisible={true}
                    countToRemove={selectedItems.length}
                    onAddButtonClicked={handleAddButtonClick}
                    onRemoveButtonClicked={handleRemoveButtonClick}
                  /> : null
              }
              {
                editItem && EditorComponent ?
                  <EditorComponent
                    {...this.props}
                    save={handleEditorSave}
                    cancel={handleEditorCancel}
                    isOpen={true}
                    value={editItem}
                  /> :
                  null
              }
            </div>
          </div>
        </div>
      );
    }
  }

  CommonList.displayName = name;
  return injectIntl(withStyles(s)(CommonList));
};

export default createListComponent;
