const db = require('./src/config/db')
const cron = require('node-cron')
const axios = require('axios')
const { clearAllCache } = require('./src/middleware/cacheMiddleware')

async function fetchAndUpdateData(offset = 0) {
  try {
    const url = `${process.env.API_URL}?kode_ref_pend=${process.env.API_KODE_REF_PEND}&offset=${offset}`
    const headers = {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      DNT: '1',
      Origin: 'https://sscasn.bkn.go.id',
      Pragma: 'no-cache',
      Referer: 'https://sscasn.bkn.go.id/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
      'sec-ch-ua':
        '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
    }

    const response = await axios.get(url, { headers })
    const data = response.data

    if (data.status === 200 && data.data && data.data.data) {
      const formasi = data.data.data

      for (const item of formasi) {
        await db.query(
          `
          INSERT INTO formasi 
          (formasi_id, ins_nm, jp_nama, formasi_nm, jabatan_nm, lokasi_nm, jumlah_formasi, disable, gaji_min, gaji_max, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (formasi_id) 
          DO UPDATE SET 
            ins_nm = EXCLUDED.ins_nm,
            jp_nama = EXCLUDED.jp_nama,
            formasi_nm = EXCLUDED.formasi_nm,
            jabatan_nm = EXCLUDED.jabatan_nm,
            lokasi_nm = EXCLUDED.lokasi_nm,
            jumlah_formasi = EXCLUDED.jumlah_formasi,
            disable = EXCLUDED.disable,
            gaji_min = EXCLUDED.gaji_min,
            gaji_max = EXCLUDED.gaji_max,
            updated_at = CURRENT_TIMESTAMP
        `,
          [
            item.formasi_id,
            item.ins_nm,
            item.jp_nama,
            item.formasi_nm,
            item.jabatan_nm,
            item.lokasi_nm,
            item.jumlah_formasi,
            item.disable ? 1 : 0,
            item.gaji_min,
            item.gaji_max,
          ]
        )
      }

      console.log(`Processed ${formasi.length} items at offset ${offset}`)

      if (formasi.length === 10) {
        await fetchAndUpdateData(offset + 10)
      } else {
        console.log('Finished fetching all pages.')
      }
    } else {
      console.log('No more data to fetch or API error.')
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

cron.schedule('0 */3 * * *', () => {
  console.log('Running fetch job...')
  clearAllCache()
  fetchAndUpdateData(0)
})

console.log('Scheduler started. Fetching will occur every three hour.')
