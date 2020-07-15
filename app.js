window.onload = function() {

    const apiBaseURL = 'https://raw.githubusercontent.com/futres/FutresAPI/master/data/'
    // const projectBaseURL
    const scientificNameInput = document.getElementById('scientific-name-input')
    const typeSelect = document.getElementById('measurement-type-select')
    const yearSelect = document.getElementById('year-select')
    const countrySelect = document.getElementById('country-select')
    const chartSelect = document.getElementById('chart-select')

    // NAV TABS
    const browseBtn = document.getElementById('browse-nav')
    const queryNav = document.getElementById('query-nav')

    browseBtn.addEventListener('click', function() {
        queryNav.classList.remove('nav-btn')
        browseBtn.classList.add('nav-btn')
        openPage('browse-tab')
    })

    queryNav.addEventListener('click', function() {
        browseBtn.classList.remove('nav-btn')
        queryNav.classList.add('nav-btn')
        openPage('query-tab')
        buildMap()
    })

    // BROWSE TAB

    // Chart Selects
    chartSelect.addEventListener('change', function() {
        let option = chartSelect.options[chartSelect.selectedIndex].value
        if (option == 'country') {
            removePreviousChart()
            showCountriesChart()
        } else if (option == 'measurement-type') {
            removePreviousChart()
            showMeasurementTypeChart()
        } else if (option == 'year-collected') {
            removePreviousChart()
            showYearCollectedChart()
        } else if (option == 'species') {
            removePreviousChart()
            showSpeciesChart()
        }
    })

    function removePreviousChart() {
        if(window.barChart != null) {
            window.barChart.destroy()
        }
    }

    async function getSpecies() {
        const res = await fetch(`${apiBaseURL}scientificName.json`)
        const data = await res.json()

        let scientificName = []
        let values = []

        data.forEach(species => {
            scientificName.push(species.scientificName)
            values.push(species.value)
        })
        return { scientificName, values }
    }

    async function showSpeciesChart() {
        const data = await getSpecies()
        makeBarChart(data.scientificName, 'Species By Scientific Name', data.values)
    }

    async function getMeasurementType() {
        const res = await fetch(`${apiBaseURL}measurementType.json`)
        const data = await res.json()

        let type = []
        let values = []

        data.forEach(item => {
            let option = new Option(`${item.measurementType}`, `${item.measurementType}`)
            typeSelect.appendChild(option)
            type.push(item.measurementType)
            values.push(item.value)
        })
        return { type, values }
    }

    async function showMeasurementTypeChart() {
        const data = await getMeasurementType()
        makeBarChart(data.type, 'Measurement Types', data.values)
    }

    async function getYearCollected() {
        const res = await fetch(`${apiBaseURL}yearCollected.json`)
        const data = await res.json()

        let yearCollected = []
        let values = []

        data.forEach(year => {
            let option = new Option(`${year.yearCollected}`, `${year.yearCollected}`)
            yearSelect.appendChild(option)
            yearCollected.push(year.yearCollected)
            values.push(year.value)
        })
        return { yearCollected, values }
    }

    async function showYearCollectedChart() {
        const data = await getYearCollected()
        makeBarChart(data.yearCollected, 'Year Collected', data.values)
    }

    // Get country data
    async function getCountry() {
        const res = await fetch(`${apiBaseURL}country.json`)
        const data = await res.json()
        let countries = []
        let values = []

        data.forEach(country => {
            let option = new Option(`${country.country}`, `${country.country}`)
            countrySelect.appendChild(option)
            countries.push(country.country)
            values.push(country.value)
        })
        return {countries, values}
    }

    // Build country chart
    async function showCountriesChart() {
        const data = await getCountry()
        makeBarChart(data.countries, 'Countries', data.values)
    }

    let purple = 'rgba(153, 102, 255, 0.2)'
    let darkerPurple = 'rgba(153, 102, 255, 1)'

async function makeBarChart(xAxisLabels, title, values) {
    let chartContainer = document.getElementById('chart-container')

    let canvas = document.createElement('canvas')
    canvas.id = 'dataChart'
    canvas.width = '500px'
    canvas.height = '600px'
    chartContainer.appendChild(canvas)

    let ctx = document.getElementById('dataChart').getContext('2d');

    window.barChart = new Chart(ctx, {
        type: 'horizontalBar',
        options: {
          maintainAspectRatio: false,
          legend: {
            display: true
          }
        },
        data: {
          labels: xAxisLabels,
          datasets: [
            {
              label: title,
              data: values,
              backgroundColor: purple,
              borderColor: darkerPurple,
              borderWidth: 1
            }
          ]
        }
      });
}

    //QUERY PAGE
    
    // Search Button onclick
    document.getElementById('search-btn').addEventListener('click', function() {
        console.log(scientificNameInput.value.trim())
    })

    // Query Page Map
    function buildMap() {
        let map = L.map('map').setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    
        L.marker([51.5, -0.09]).addTo(map)
            .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
            .openPopup();
    }

    function openPage(pageName) {
        let tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
        }
      
        // Show the specific tab content
        document.getElementById(pageName).style.display = "flex";
      }
}