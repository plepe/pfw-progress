const httpRequest = require('./httpRequest.js')

window.onload = () => {
  httpRequest('progress.csv', {}, (err, result) => {
    if (err) {
      return alert(err)
    }

    let rows = result.body.split(/\n/g)
    let labels = []
    let data = []

    rows.forEach(row => {
      let v = row.split(/:/)
      labels.push(v[0])
      data.push(v[1])
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
	label: 'Unterschriften',
	data,
	backgroundColor: '#f00',
	borderColor: '#000'
      }]
    },
    options: {}
  })
}
