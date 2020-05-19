const httpRequest = require('./httpRequest.js')

let data_gesamt = []
let labels_gesamt = []
let label_gesamt = 'Platz für Wien - Unterschriften (Stand jeweils um Mitternacht)'

let data_offline, data_pdb
let first_day = date_format(new Date())
let last_day = ''

let chart1, chart2

function date_format (date) {
  return date.toISOString().substr(0, 10)
}

window.onload = () => {
  let as = document.getElementsByTagName('a')
  for (let i = 0; i < as.length; i++) {
    if (as[i].hasAttribute('data-plz')) {
      as[i].onclick = () => {
        show(as[i].getAttribute('data-plz'))
        return false
      }
    }
  }

  httpRequest('progress.csv?' + (new Date().getDate()), {}, (err, result) => {
    if (err) {
      return alert(err)
    }

    let rows = result.body.split(/\n/g)

    rows.forEach(row => {
      let v = row.split(/:/)
      if (v.length >= 2) {
	labels_gesamt.push(v[0])
	data_gesamt.push(v[1])
      }
    })

    render(labels_gesamt, data_gesamt, label_gesamt)
  })
}

function show (plz) {
  if (plz === '') {
    return render(labels_gesamt, data_gesamt, label_gesamt)
  }

  if (typeof data_offline === 'undefined') {
    return httpRequest('csv.php?' + (new Date().getDate()), {}, (err, result) => {
      if (err) {
        return alert(err)
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

      show(plz)
    })
  }

  let day = first_day
  let l = []
  let d = []
  let c = 0
  while (day <= last_day) {
    let _d = date_format(day)

    if (_d in data_offline && plz in data_offline[_d]) {
      c += parseInt(data_offline[_d][plz])
    }

    if (_d in data_pdb && plz in data_pdb[_d]) {
      c += parseInt(data_pdb[_d][plz])
    }

    d.push(c)
    l.push(_d)
    day = new Date(day.getTime() + 86400000)
  }

  render(l, d, 'Platz für Wien - Unterschriften (' + plz + ')')
}

function render (labels, data, label) {
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
}
