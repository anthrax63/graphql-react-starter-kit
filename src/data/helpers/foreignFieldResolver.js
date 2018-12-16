import check from 'check-types';

/**
 * Creates resolver for GraphQL resolve method
 * @param {string} foreignField Name of property of parent object that is id of foreign type
 * @param {GraphQLObjectType} foreignType Type of foreign object
 * @return {function(*)}
 */
export function createResolver(foreignField, foreignType) {
  check.assert.assigned(foreignField, '"foreignField" is required');
  check.assert.assigned(foreignType, '"foreignType" is required');
  const ServiceType = foreignType._typeConfig.service;
  check.assert.assigned(ServiceType, 'Type should contain "service" property');
  const service = new ServiceType();
  return (parent) => {
    const id = parent[foreignField];
    if (!id) {
      return null;
    }
    return service.get({id});
  };
}
