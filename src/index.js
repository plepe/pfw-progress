const httpRequest = require('./httpRequest.js')

let data_gesamt = []
let labels_gesamt = []
let label_gesamt = 'Platz für Wien - Unterschriften (Stand jeweils um Mitternacht)'

let data_plz
let first_day = date_format(new Date())
let last_day = ''

let chart

function date_format (date) {
  return date.toISOString().substr(0, 10)
}

window.onload = () => {
  let as = document.getElementsByTagName('a')
  for (let i = 0; i < as.length; i++) {
    as[i].onclick = () => show(as[i].getAttribute('data-plz'))
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

  if (typeof data_plz === 'undefined') {
    return httpRequest('plz.csv?' + (new Date().getDate()), {}, (err, result) => {
      if (err) {
        return alert(err)
      }

      let rows = result.body.split(/\n/g)
      data_plz = {}

      rows.slice(1).forEach(row => {
        let v = row.split(/:/)
        if (v.length >= 3) {
          if (!(v[0] in data_plz)) {
            data_plz[v[0]] = {}
          }
          data_plz[v[0]][v[1]] = v[2]

          if (v[0] < first_day) {
            first_day = v[0]
          }

          if (v[0] > last_day) {
            last_day = v[0]
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

    if (_d in data_plz && plz in data_plz[_d]) {
      c += parseInt(data_plz[_d][plz])
    }

    d.push(c)
    l.push(_d)
    day = new Date(day.getTime() + 86400000)
  }

  render(l, d, 'Platz für Wien - Unterschriften (' + plz + ')')
}

function render (labels, data, label) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (typeof chart === 'undefined') {
    chart = new Chart(ctx, {
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
      options: {}
    })
  } else {
    chart.data.datasets[0].labels = labels
    chart.data.datasets[0].data = data
    chart.update()
  }
}
