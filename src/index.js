const parallel = require('run-parallel')

const httpRequest = require('./httpRequest.js')
const pfwGetCurrent = require('./pfwGetCurrent.js')

let data_gesamt = []
let data_bevoelkerung_bezirke = []
let data_bevoelkerung_gesamt
let labels_gesamt = []
let label_gesamt = 'Platz für Wien - Unterschriften (Stand jeweils um Mitternacht)'

let data_offline, data_pdb, data_current
let first_day = date_format(new Date())
let last_day = ''
const goal = 56650

let chart1, chart2

function date_format (date) {
  return date.toISOString().substr(0, 10)
}

function update () {
  let form = document.getElementById('selector')

  let plz = form.elements.plz.value
  let types = ['offline','pdb'].filter(type => !!document.getElementById('type-' + type).checked)

  show(plz, types)
}

window.onload = () => {
  let as = document.getElementsByTagName('input')
  for (let i = 0; i < as.length; i++) {
    as[i].onchange = () => update()
  }

  parallel([
    (done) => {
      httpRequest('progress.csv?' + (new Date().getDate()), {}, (err, result) => {
        if (err) {
          return done(err)
        }

        let rows = result.body.split(/\n/g)

        rows.forEach(row => {
          let v = row.split(/,/)
          if (v.length >= 2) {
            labels_gesamt.push(v[0])
            data_gesamt.push(v[1])
          }
        })

        done()
      })
    },
    (done) => {
      httpRequest('bevölkerung.csv', {}, (err, result) => {
        if (err) {
          return done(err)
        }

        let rows = result.body.split(/\n/g)

        rows.forEach(row => {
          let v = row.split(/,/)
          if (v.length == 2) {
            data_bevoelkerung_bezirke.push(parseInt(v[1]))
          }
        })

        data_bevoelkerung_gesamt = data_bevoelkerung_bezirke.reduce((v, sum) => (sum || 0) + v)

        done()
      })
    },
    pfwGetCurrent
  ],
  (err, result) => {
    if (err) {
      return alert(err)
    }

    data_current = result[2]

    data_gesamt.push(data_current)
    labels_gesamt.push('Aktuell')

    update()
  })
}

function load_detail (callback) {
  httpRequest('csv.php?' + (new Date().getDate()), {}, (err, result) => {
    if (err) {
      return callback(err)
    }

    let rows = result.body.split(/\n/g)
    data_offline = {}
    data_pdb = {}

    rows.slice(1).forEach(row => {
      let v = row.split(/,/)
      if (v.length >= 4) {
        let db = v[0] === 'pdb' ? data_pdb :
          v[0] === 'offline' ? data_offline : {}

        if (!(v[1] in db)) {
          db[v[1]] = {}
        }
        db[v[1]][v[2]] = v[3]

        if (v[1] < first_day) {
          first_day = v[1]
        }

        if (v[1] > last_day) {
          last_day = v[1]
        }
      }
    })

    first_day = new Date(first_day + ' 12:00:00')
    last_day = new Date(last_day + ' 12:00:00')

    callback(null)
  })
}

function show (plz, types) {
  if (typeof data_offline === 'undefined') {
    return load_detail((err) => {
      if (err) {
        return alert(err)
      }

      show(plz, types)
    })
  }

  if (plz === '') {
    return render(labels_gesamt, data_gesamt, label_gesamt, [ data_current, data_bevoelkerung_gesamt ], 'Platz für Wien - Anteil Unterschriften an Bevölkerung (Gesamt)', [
      Object.values(data_offline).reduce((sum, d) => {
        return sum + Object.values(d).reduce((sum, d) => {
          return sum + parseInt(d)
        }, 0)
      }, 0),
      Object.values(data_pdb).reduce((sum, d) => {
        return sum + Object.values(d).reduce((sum, d) => {
          return sum + parseInt(d)
        }, 0)
      }, 0)
    ])
  }

  let day = first_day
  let l = []
  let d = []
  let offline = 0, pdb = 0
  let c = 0
  while (day <= last_day) {
    let _d = date_format(day)

    if (plz === '*') {
      if (types.includes('offline') && _d in data_offline) {
        for (let _plz in data_offline[_d]) {
          c += parseInt(data_offline[_d][_plz])
          offline += parseInt(data_offline[_d][_plz])
        }
      }

      if (types.includes('pdb') && _d in data_pdb) {
        for (let _plz in data_pdb[_d]) {
          c += parseInt(data_pdb[_d][_plz])
          pdb += parseInt(data_pdb[_d][_plz])
        }
      }
    } else {
      if (types.includes('offline') && _d in data_offline && plz in data_offline[_d]) {
        c += parseInt(data_offline[_d][plz])
        offline += parseInt(data_offline[_d][plz])
      }

      if (types.includes('pdb') && _d in data_pdb && plz in data_pdb[_d]) {
        c += parseInt(data_pdb[_d][plz])
        pdb += parseInt(data_pdb[_d][plz])
      }
    }

    d.push(c)
    l.push(_d)
    day = new Date(day.getTime() + 86400000)
  }

  if (l[l.length - 1] === date_format(new Date())) {
    l[l.length - 1] = 'Aktuell'
  }

  let pieChart = [ data_current, data_bevoelkerung_gesamt ]
  let m = plz.match(/^1([0-2][0-9])0$/)
  if (m) {
    pieChart = [ d[d.length - 1], data_bevoelkerung_bezirke[m[1] - 1] ]
  }

  render(l, d, 'Platz für Wien - Unterschriften (' + (plz === '*' ? 'Gesamt' : plz) + ' - nach Zeitpunkt der Eintragung)', pieChart, 'Platz für Wien - Anteil Unterschriften an Bevölkerung (' + (plz === '*' ? 'Gesamt' : plz) + ')', [ offline, pdb ])
}

function render (labels, data, label, pieChart, pieLabel, aktuell) {
  let barLast = 0
  barData = data.map(v => {
    const h = v - barLast
    barLast = v
    return h
  })

  if (typeof chart1 === 'undefined') {
    chart1 = new Chart('chart1', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: 'rgb(239, 121, 45)',
          borderColor: 'rgb(14, 83, 141)'
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    })

    chart2 = new Chart('chart2', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data: barData,
          backgroundColor: 'rgb(239, 121, 45)',
          borderWidth: 2,
          borderColor: 'rgb(14, 83, 141)'
        }]
      },
      options: {}
    })
  } else {
    chart1.data.datasets[0].label = label
    chart1.data.labels = labels
    chart1.data.datasets[0].data = data
    chart1.update()

    chart2.data.datasets[0].label = label
    chart2.data.labels = labels
    chart2.data.datasets[0].data = barData
    chart2.update()
  }

  document.getElementById('aktuell').innerHTML =
    'Aktuell: ' + pieChart[0] + ' (' + aktuell[0] + ' offline, ' + aktuell[1] + ' online), ' +
    (pieChart[0] / pieChart[1] * 100).toFixed(2) + '% der Bevölkerung, ' +
    (pieChart[0] / goal * 100).toFixed(1) + '% Zielerreichung'
}
