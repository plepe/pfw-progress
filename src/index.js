window.onload = () => {
  render()
}

function render () {
  const ctx = document.getElementById('chart').getContext('2d');
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['a', 'b', 'c', 'd'],
      datasets: [{
	label: 'Unterschriften',
	data: [1, 2, 6, 7],
	backgroundColor: '#f00',
	borderColor: '#000'
      }]
    },
    options: {}
  })
}
