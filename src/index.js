const httpRequest = require('./httpRequest.js')

window.onload = () => {
  httpRequest('progress.csv?' + (new Date().getDate()), {}, (err, result) => {
    if (err) {
      return alert(err)
    }

    let rows = result.body.split(/\n/g)
    let labels = []
    let data = []

    rows.forEach(row => {
      let v = row.split(/:/)
      if (v.length >= 2) {
	labels.push(v[0])
	data.push(v[1])
      }
    })

    render(labels, data)
  })
}

function render (labels, data) {
  const ctx = document.getElementById('chart').getContext('2d');
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
	label: 'Platz für Wien - Unterschriften (Stand jeweils um Mitternacht)',
	data,
	backgroundColor: 'rgb(239, 121, 45)',
	borderColor: 'rgb(14, 83, 141)'
      }]
    },
    options: {}
  })
}
