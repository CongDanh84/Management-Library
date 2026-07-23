const getPagination = (query, defaultLimit = 10, maxLimit = 100) => {
    let page = parseInt(query.page) || 1;
    let limit = parseInt(query.limit) || defaultLimit;

    if (page < 1) page = 1;
    if (limit < 1) limit = defaultLimit;
    if (limit > maxLimit) limit = maxLimit;

    const skip = (page - 1) * limit;
    return { page, limit, skip };
}
const buildPaginationResult = (data, totalItems, page, limit) => {
    return {
        data,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit)
        }
    };
}

module.exports = { getPagination, buildPaginationResult };