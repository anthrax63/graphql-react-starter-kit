import {NotFoundError} from '../../constants/errors';
import check from 'check-types';
import mongoose from 'mongoose';

const ActionTypes = {
  create: 'CREATE',
  update: 'UPDATE',
  remove: 'REMOVE'
};

export default class CrudService {
  constructor(modelName, contextQuery) {
    this._model = mongoose.model(modelName);
    this._modelName = modelName;
    this._contextQuery = contextQuery;
  }

  /**
   * Inserts a new item
   * @param {object} props
   * @return {Promise.<object>}
   */
  create(props) {
    const Model = this._model;
    if (props.id) {
      props._id = props.id;
      delete props.id;
    }
    // logDebug('CREATE', props);
    let obj = new Model(props);
    return obj.save().then((newObject) => {
      this._pushModelAction(ActionTypes.create, {id: newObject._id});
      return newObject;
    });
  }

  /**
   * Replaces an item
   * @param {object} props
   * @return {Promise.<object>} Replaced object
   */
  replace(props) {
    const Model = this._model;
    let id = props.id || props._id;
    check.assert.assigned(id, '"props" should contain "id" or "_id" property');
    let obj = {...props, _id: id};
    delete obj.id;
    return Model
      .findByIdAndUpdate(id, obj, {runValidators: true, new: true})
      .exec()
      .then((newObject) => {
        this._pushModelAction(ActionTypes.update, {id: newObject._id});
        return newObject;
      });
  }

  /**
   * Replaces an item or creates if it does not exist
   * @param {object} props
   * @return {Promise.<object>} Replaced object
   */
  createOrReplace(props) {
    const Model = this._model;
    let id = props.id || props._id;
    check.assert.assigned(id, '"props" should contain "id" or "_id" property');
    let obj = {...props, _id: id};
    delete obj.id;
    return Model
      .findById(id)
      .exec()
      .then((doc) => {
        if (!doc) {
          return this.create(props);
        } else {
          return this.replace(props);
        }
      })
      .then((newObject) => {
        this._pushModelAction(ActionTypes.update, {id: newObject._id});
        return newObject;
      });
  }

  /**
   * Merges an item or creates if it does not exist
   * @param {object} props
   * @return {Promise.<object>} Replaced object
   */
  createOrMerge(props) {
    const Model = this._model;
    let id = props.id || props._id;
    check.assert.assigned(id, '"props" should contain "id" or "_id" property');
    let obj = {...props, _id: id};
    delete obj.id;
    return Model
      .findById(id)
      .exec()
      .then((doc) => {
        if (!doc) {
          return this.create(props);
        } else {
          return this.merge(props);
        }
      })
      .then((newObject) => {
        this._pushModelAction(ActionTypes.update, {id: newObject._id});
        return newObject;
      });
  }

  /**
   * Updates an item by merge passed props to existing item
   * @param props
   * @return {Promise.<object>}
   */
  merge(props) {
    const Model = this._model;
    let id = props.id || props._id;
    check.assert.assigned(id, '"props" should contain "id" or "_id" property');
    let obj = {...props, _id: id};
    delete obj.id;
    return Model
      .findById(id)
      .exec()
      .then((doc) => {
        if (!doc) {
          throw new NotFoundError({id});
        }
        Object.assign(doc, obj);
        return doc.save();
      })
      .then((newObject) => {
        this._pushModelAction(ActionTypes.update, {id: newObject._id});
        return newObject;
      });
  }

  update(props) {
    const Model = this._model;
    let id = props.id || props._id;
    check.assert.assigned(id, '"props" should contain "id" or "_id" property');
    let obj = {...props, _id: id};
    delete obj._id;
    delete obj.id;
    return Model
      .findByIdAndUpdate(id, {$set: obj}, {new: true})
      .exec()
      .then((newObject) => {
        this._pushModelAction(ActionTypes.update, {id: newObject._id});
        return newObject;
      });
  }

  /**
   * Lists list by query
   * @param {object} query
   * @param {number} skip
   * @param {number} limit
   * @param {object} sort
   * @return {Promise.<object[]>}
   */
  async list({query, skip, limit, sort}) {
    const Model = this._model;
    let request = Model.find(this._makeQuery(query));
    if (skip !== undefined) {
      request = request.skip(skip);
    }
    if (limit !== undefined) {
      if (limit === 0) {
        throw new Error('limit should be more than 0');
      }
      request = request.limit(limit);
    }
    if (sort) {
      request = request.sort(sort);
    }
    const result = await request.exec();
    return result;
  }

  get(props) {
    // logDebug('GET', this._modelName,  props);
    const Model = this._model;
    let id = (typeof props === 'string' || props instanceof mongoose.Types.ObjectId) ? props : (props.id || props._id);
    if (!id) {
      return null;
    }
    let request = Model.findOne(this._makeQuery({_id: id}));
    return request.exec()
      .then((u) => {
        if (u) {
          return u;
        }
        throw new NotFoundError({id});
      });
  }

  /**
   * Returns one object
   * @param {object} query
   * @return {Promise.<object[]>}
   */
  getOne(query) {
    // logDebug('GET ONE', query);
    const Model = this._model;
    let request = Model.findOne(this._makeQuery(query));
    return request.exec();
  }

  count(query) {
    // logDebug('COUNT', JSON.stringify({query}));
    if (query.query) {
      query = query.query;
    }
    const Model = this._model;
    return Model.count(this._makeQuery({...query})).exec();
  }

  distinct(field, query = {}) {
    // logDebug('DISTINCT', field, JSON.stringify({query}));
    const Model = this._model;
    return Model.distinct(field, this._makeQuery({...query})).exec();
  }

  /**
   * Removes multiple list by id or array of id
   * @param {array|string} ids
   * @return {Promise.<boolean>}
   */
  remove(ids) {
    check.assert.assigned(ids, '"ids" is required');
    if (!(ids instanceof Array)) {
      ids = [ids];
    }
    const Model = this._model;
    return Model
      .remove({_id: {$in: ids}})
      .exec()
      .then(() => {
        this._pushModelAction(ActionTypes.remove, {ids});
        return true;
      });
  }

  _pushModelAction(actionType, payload) {
    // Empty
  }

  _makeQuery(query) {
    if (!this._contextQuery) {
      return query;
    }
    return {$and: [query, this._contextQuery]};
  }

}
