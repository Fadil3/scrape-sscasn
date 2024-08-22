const db = require('../config/db')
const NodeCache = require('node-cache')

exports.getAllFormasi = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit
  const sortBy = req.query.sortBy || 'created_at'
  const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC'
  const searchTerm = req.query.search || ''

  try {
    let queryParams = []
    let countQuery = 'SELECT COUNT(*) FROM formasi'
    let dataQuery = 'SELECT * FROM formasi'

    if (searchTerm) {
      countQuery +=
        ' WHERE ins_nm ILIKE $1 OR jp_nama ILIKE $1 OR formasi_nm ILIKE $1 OR jabatan_nm ILIKE $1'
      dataQuery +=
        ' WHERE ins_nm ILIKE $1 OR jp_nama ILIKE $1 OR formasi_nm ILIKE $1 OR jabatan_nm ILIKE $1'
      queryParams.push(`%${searchTerm}%`)
    }

    dataQuery += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${
      queryParams.length + 1
    } OFFSET $${queryParams.length + 2}`
    queryParams.push(limit, offset)

    // Get total count of formasi
    const countResult = await db.query(
      countQuery,
      searchTerm ? [queryParams[0]] : []
    )
    const totalCount = parseInt(countResult.rows[0].count)

    // Get paginated formasi data
    const { rows } = await db.query(dataQuery, queryParams)

    res.json({
      data: rows,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount: totalCount,
      },
      sort: {
        sortBy: sortBy,
        sortOrder: sortOrder,
      },
      search: searchTerm,
    })
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching formasi', error: err.message })
  }
}

exports.getFormasiById = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM formasi WHERE formasi_id = $1',
      [req.params.id]
    )
    if (rows.length > 0) {
      res.json(rows[0])
    } else {
      res.status(404).json({ message: 'Formasi not found' })
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching formasi', error: err.message })
  }
}
