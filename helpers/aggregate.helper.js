const methods = {
  aggregateByFindAll(_q, from, localField, foreignField, offset, limit, pushField) {
    return [
      { $match: _q.query },
      { $sort: _q.sort },
      { $lookup: { from: from, localField: localField, foreignField: foreignField, as: 'count' } },
      {
        $group: {
          _id: null,
          data: pushField,
        },
      },
      {
        $project: {
          _id: 0,
          data: { $slice: ['$data', offset, limit] },
        },
      },
    ]
  },
}

module.exports = { ...methods }
