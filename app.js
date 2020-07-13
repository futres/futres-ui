window.onload = function() {
    
    let map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([51.5, -0.09]).addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();

    
    const baseURL = 'https://raw.githubusercontent.com/futres/FutresAPI/master/data/'

    const scientificNameInput = document.getElementById('scientific-name-input')

    const typeSelect = document.getElementById('measurement-type-select')
    const yearSelect = document.getElementById('year-select')
    const countrySelect = document.getElementById('country-select')

    async function getMeasurementType() {
        const res = await fetch(`${baseURL}measurementType.json`)
        const data = await res.json()

        data.forEach(item => {
            let option = new Option(`${item.measurementType}`, `${item.measurementType}`)
            typeSelect.appendChild(option)
        })
    }

    async function getYearCollected() {
        const res = await fetch(`${baseURL}yearCollected.json`)
        const data = await res.json()

        data.forEach(year => {
            let option = new Option(`${year.yearCollected}`, `${year.yearCollected}`)
            yearSelect.appendChild(option)
        })
    }

    async function getCountry() {
        const res = await fetch(`${baseURL}country.json`)
        const data = await res.json()

        data.forEach(country => {
            let option = new Option(`${country.country}`, `${country.country}`)
            countrySelect.appendChild(option)
        })
    }

    document.getElementById('search-btn').addEventListener('click', function() {
        console.log(scientificNameInput.value.trim())
    })

    getMeasurementType()
    getYearCollected()
    getCountry()

}