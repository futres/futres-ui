window.onload = function() {
    const apiBaseURL = 'https://raw.githubusercontent.com/futres/FutresAPI/master/data/'
    //const projBaseURL = 'https://api.geome-db.org/projects/stats?includePublic=true'

    const numberSelect = document.getElementById('number-results')
    const mapRadio = document.getElementById('radio-map')
    const tableRadio = document.getElementById('radio-table')
    const mapContainer = document.getElementById('map-container')
    const queryTableContainer = document.getElementById('query-table-container')

    const countrySelect = document.getElementById('country-select')
    const scientificNameSelect = document.getElementById('scientific-name-select')
    const typeSelect = document.getElementById('measurement-type-select')
    const yearSelect = document.getElementById('year-select')


    /******************** 
      MAPPING FUNCTIONS
    *********************/
   let map = L.map('map', {
    minZoom: 2,
    maxZoom: 25
})
addMapBaseLayer()

function addMapBaseLayer() {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

        map.setView([0,0], 0)
        map.setZoom(1)
}

function plotPoint(sciName, content, lat, lon) {
    let geojsonFeature = {
        "type": "Feature",
        "properties": {
            "name": sciName,
            "popupContent": content
        },
        "geometry": {
            "type": "Point",
            "coordinates": [lon, lat]
        }
    }

    if (lat == undefined && lon == undefined) {
        console.log('lat long not found')
    } else {
        let zoom = 5
        let marker = L.marker([0,0], 3).addTo(map)
        marker.setLatLng([lat,lon])
        .bindPopup(`Scientific Name: ${geojsonFeature.properties.name} <br>
        Year Collected: ${geojsonFeature.properties.popupContent}`)

        map.setView([lat, lon], zoom)
    }

}

// TODO: There might be a better place to call these.
populateCountryDropdown()
populateSpeciesDropdown()
populateYearDropdown()
populateMeasurementTypeDropdown()


/******************** 
    QUERY PAGE 
*********************/

// Search Button onclick
document.getElementById('search-btn').addEventListener('click', function() {
    let sciName = scientificNameSelect.value
    let type = typeSelect.value
    let year = yearSelect.value
    let country = countrySelect.value
    let number = numberSelect.value


    // Values for inserting into URLs
    let sciNameEncoded = encodeURIComponent(sciName)
    let typeEncoded = encodeURIComponent(type)
    let countryEncoded = encodeURIComponent(country)


    // If no options are selected
    if (sciName == '' && type == '' && year == '' && country == '') {
        alert('Please select at least one search term')
    
    } else if (type == '' && year == '' && country == '') {
        removeTable('query-table')
        fetchByScientificName(number, sciName, sciNameEncoded)   
    
    } else if (sciName == '' && type == '' && country == '') {
        removeTable('query-table')
        fetchByYearCollected(number, year) 
    
    } else if (sciName == '' && type == '' && year == '') {
        removeTable('query-table')
        //TODO: Figure out why this does not work
        fetchByCountry(number, country, countryEncoded)
    
    } else if (sciName == '' &&  year == '' && country == '') {
        removeTable('query-table')
        fetchByType(number, type, typeEncoded)

    } else if (sciName && type && year && country) {
        removeTable('query-table')
        // const url = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=10&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++yearCollected:%3E=1868+AND++yearCollected:%3C=${year}++AND++scientificName:${sciName}++AND++measurementType:${type}++AND++country:${country}&pretty`
        // const scientificNameURL = "https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=100&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++yearCollected:%3E=2002+AND++yearCollected:%3C=2003++AND++scientificName:Puma+concolor++AND++measurementType:body+mass++AND++country:USA&pretty"
        const allFieldsURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++yearCollected:${year}++AND++scientificName:${sciNameEncoded}++AND++measurementType:${typeEncoded}++AND++country:${countryEncoded}&pretty`
        fetchData(allFieldsURL)
    } else if (sciName && type) {
        const nameAndTypeURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++scientificName:${sciNameEncoded}++AND++measurementType:${typeEncoded}&pretty`
        fetchData(nameAndTypeURL)

    } else if (sciName && year) {
        const nameYearURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++yearCollected:${year}++AND++scientificName:${sciNameEncoded}&pretty`
        fetchData(nameYearURL)

    } else if (sciName && country) {
        const sciNameAndCountryURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++scientificName:${sciNameEncoded}++AND++country:${countryEncoded}&pretty`
        fetchData(sciNameAndCountryURL)

    } else if (type && year) {
        const typeYearURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++yearCollected:${year}++AND++measurementType:${typeEncoded}&pretty`
        fetchData(typeYearURL)

    } else if (country && year) {
        const countryYearURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++yearCollected:${year}++AND++country:${countryEncoded}&pretty`
        fetchData(countryYearURL)

    } else if (type && country) {
        const typeCountryURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++measurementType:${typeEncoded}++AND++country:${countryEncoded}&pretty`
        fetchData(typeCountryURL)

    } else if (type && year && sciName) {
        console.log(sciName, type, year);
        //TODO: Why does year not register
        const typeYearNameURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++yearCollected:${year}++AND++scientificName:${sciNameEncoded}++AND++measurementType:${typeEncoded}&pretty`
        fetchData(typeYearNameURL)

    } else if (country && year && sciName) {
        const countryYearNameURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++yearCollected:${year}++AND++scientificName:${sciNameEncoded}++AND++country:${countryEncoded}&pretty`
        fetchData(countryYearNameURL)

    } else if (type && year && country) {
        const typeYearCountryURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++yearCollected:${year}++AND++measurementType:${typeEncoded}++AND++country:${countryEncoded}&pretty`
        fetchData(typeYearCountryURL)
    }
})

function fetchData(URL) {
    fetch(URL)
    .then(res => res.json())
    .then(data => {
        // console.log(data.hits.hits);
        let dataArr = data.hits.hits

        if (tableRadio.checked == true && mapRadio.checked == false) {
            queryTableContainer.style.display = 'flex'
            mapContainer.style.display = 'none'
            buildQueryTable('query-table')

            dataArr.forEach(hit => {
                let x = hit._source
                // console.log(x.measurementType);
                //     console.log(x.scientificName)
                    let table = document.getElementById('query-table')
                    let tr = document.createElement('tr')
                    tr.innerHTML = `
                    <td>${x.scientificName}</td>
                    <td>${x.country}</td>
                    <td>${x.yearCollected}</td>
                    <td>${x.measurementType}</td>
                    <td>${x.measurementValue}</td>
                    <td>${x.measurementUnit}</td>
                    <td>${x.sex}</td>
                    <td>${x.decimalLatitude}</td>
                    <td>${x.decimalLongitude}</td>
                    `
                    table.appendChild(tr)
            })
        } else if (tableRadio.checked == false && mapRadio.checked == true) {
            queryTableContainer.style.display = 'none'
            mapContainer.style.display = 'flex'

            dataArr.forEach(hit => {
                let x = hit._source
                plotPoint(x.scientificName, x.yearCollected, x.decimalLatitude, x.decimalLongitude)
            })
        } else {
            alert('Select Map or Table');
        }
    })
}


function fetchByScientificName(number, name, uriName) {
// const scientificNameURL = `https://plantphenology.org/futresapi/v1/query/_search?pretty&from=0&size=${number}&q=scientificName=${name}`
// const scientificNameURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++scientificName:${name}&pretty`

    const scientificNameURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++yearCollected:%3E=1868+AND++yearCollected:%3C=2020++AND++scientificName:${uriName}&pretty`

    // console.log(scientificNameURL);
    fetch(scientificNameURL)
    .then(res => res.json())
    .then(data => {
        let dataArr = data.hits.hits

        // If Table Radio is selected, build table
        if (tableRadio.checked == true && mapRadio.checked == false) {
            queryTableContainer.style.display = 'flex'
            mapContainer.style.display = 'none'
            buildQueryTable('query-table')

            dataArr.forEach(hit => {
                let x = hit._source
                    let table = document.getElementById('query-table')
                    let tr = document.createElement('tr')
                    tr.innerHTML = `
                    <td>${x.scientificName}</td>
                    <td>${x.country}</td>
                    <td>${x.yearCollected}</td>
                    <td>${x.measurementType}</td>
                    <td>${x.measurementValue}</td>
                    <td>${x.measurementUnit}</td>
                    <td>${x.sex}</td>
                    <td>${x.decimalLatitude}</td>
                    <td>${x.decimalLongitude}</td>
                    `
                    table.appendChild(tr)
            })
        } else if (tableRadio.checked == false && mapRadio.checked == true) {
            queryTableContainer.style.display = 'none'
            mapContainer.style.display = 'flex'

            dataArr.forEach(hit => {
                let x = hit._source
                if (name == x.scientificName) {
                    plotPoint(x.scientificName, x.yearCollected, x.decimalLatitude, x.decimalLongitude)
                }
            })
        } else {
            alert('Select Map or Table');
        }
    })
}

function fetchByYearCollected(number, year) {
    const yearURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++yearCollected:>=1868+AND++yearCollected:<=${year}`
    fetch(yearURL)
    .then(res => res.json())
    .then(data => {
        let dataArr = data.hits.hits

        if (tableRadio.checked == true && mapRadio.checked == false) {
            queryTableContainer.style.display = 'flex'
            mapContainer.style.display = 'none'
            buildQueryTable('query-table')

            dataArr.forEach(hit => {
                let x = hit._source
                let table = document.getElementById('query-table')
                        
                if(year == x.yearCollected) {
                    let tr = document.createElement('tr')
                    tr.innerHTML = `
                    <td>${x.scientificName}</td>
                    <td>${x.country}</td>
                    <td>${x.yearCollected}</td>
                    <td>${x.measurementType}</td>
                    <td>${x.measurementValue}</td>
                    <td>${x.measurementUnit}</td>
                    <td>${x.sex}</td>
                    <td>${x.decimalLatitude}</td>
                    <td>${x.decimalLongitude}</td>
                    `
                    table.appendChild(tr)
                }
                        
            })
        } else if (tableRadio.checked == false && mapRadio.checked == true) {
            queryTableContainer.style.display = 'none'
            mapContainer.style.display = 'flex'
            dataArr.forEach(hit => {
                let x = hit._source

                if (year == x.yearCollected) {
                    console.log('LAT: ' + x.decimalLatitude + ' LON: ' + x.decimalLongitude);
                    plotPoint(x.scientificName, x.yearCollected, x.decimalLatitude, x.decimalLongitude)
                }
            })
        } else {
            alert('Select Map or Table');
        }
    })
}

//TODO: Figure out why this does not work
function fetchByCountry(number, country, uriCountry) {
    console.log(uriCountry, country);
    // const countryURL = `https://plantphenology.org/futresapi/v1/query/_search?pretty&from=0&size=${number}&q=country:${uriCountry}`
    const countryURL = `https://www.plantphenology.org/futresapi/v1/query/_search?from=0&size=${number}&_source=decimalLatitude,decimalLongitude,yearCollected,scientificName,sex,measurementType,country,measurementUnit,measurementValue&q=++country:${uriCountry}&pretty`

    console.log(countryURL);
    fetch(countryURL)
    .then(res => res.json())
    .then(data => {
        let dataArr = data.hits.hits
        console.log(dataArr);

        // If Table Radio is selected, build table
        if (tableRadio.checked == true && mapRadio.checked == false) {
            queryTableContainer.style.display = 'flex'
            mapContainer.style.display = 'none'
            buildQueryTable('query-table')

            dataArr.forEach(hit => {
                let x = hit._source
                console.log(x.country)
                    let table = document.getElementById('query-table')
                    let tr = document.createElement('tr')
                    tr.innerHTML = `
                    <td>${x.scientificName}</td>
                    <td>${x.country}</td>
                    <td>${x.yearCollected}</td>
                    <td>${x.measurementType}</td>
                    <td>${x.measurementValue}</td>
                    <td>${x.measurementUnit}</td>
                    <td>${x.sex}</td>
                    `
                    table.appendChild(tr)
                
            })
        } else if (tableRadio.checked == false && mapRadio.checked == true) {
            queryTableContainer.style.display = 'none'
            mapContainer.style.display = 'flex'
            dataArr.forEach(hit => {
                let x = hit._source

                if (country == x.country) {
                    console.log('LAT: ' + x.decimalLatitude + ' LON: ' + x.decimalLongitude);
                    plotPoint(x.scientificName, x.yearCollected, x.decimalLatitude, x.decimalLongitude)
                }
            })
        } else {
            alert('Select Map or Table');
        }
    })
    
}

function fetchByType(number, type, uriType) {
    const typeURL = `https://plantphenology.org/futresapi/v1/query/_search?pretty&from=0&size=${number}&q=measurementType=${uriType}`
    
    fetch(typeURL)
    .then(res => res.json())
    .then(data => {
        let dataArr = data.hits.hits

        // If Table Radio is selected, build table
        if (tableRadio.checked == true && mapRadio.checked == false) {
            queryTableContainer.style.display = 'flex'
            mapContainer.style.display = 'none'
            buildQueryTable('query-table')

            dataArr.forEach(hit => {
                let x = hit._source
                if (type == x.measurementType) {
                    let table = document.getElementById('query-table')
                    let tr = document.createElement('tr')
                    tr.innerHTML = `
                    <td>${x.scientificName}</td>
                    <td>${x.country}</td>
                    <td>${x.yearCollected}</td>
                    <td>${x.measurementType}</td>
                    <td>${x.measurementValue}</td>
                    <td>${x.measurementUnit}</td>
                    <td>${x.sex}</td>
                    `
                    table.appendChild(tr)
                }
            })
        } else if (tableRadio.checked == false && mapRadio.checked == true) {
            queryTableContainer.style.display = 'none'
            mapContainer.style.display = 'flex'
            dataArr.forEach(hit => {
                let x = hit._source

                if (type == x.measurementType) {
                    console.log('LAT: ' + x.decimalLatitude + ' LON: ' + x.decimalLongitude);
                    plotPoint(x.scientificName, x.yearCollected, x.decimalLatitude, x.decimalLongitude)
                }
            })
        } else {
            alert('Select Map or Table');
        }

    })
}


    // Table heading sort 
    let th = document.getElementsByClassName('ascending')
    for (let i = 0; i < th.length; i++ ) {
        th[i].addEventListener('click', function() {
            if (this.classList.contains('ascending')) {
                this.classList.replace('ascending', 'descending')
            } else {
                this.classList.replace('descending', 'ascending')
            }
        })
    }

    // Remove any table generic function
    function removeTable(tableId) {
        let table = document.getElementById(tableId)
        if (table) {
            table.parentNode.removeChild(table)
        }
    }

    // Build table for query page
    function buildQueryTable(tableId) {
        let table = document.createElement('table')
        table.id = tableId

        let trHeader = document.createElement('tr')
        trHeader.innerHTML = `
        <th>Scientific Name</th>
        <th>Country</th>
        <th>Year Collected</th>
        <th>Measurement Type</th>
        <th>Measurement Value</th>
        <th>Measurement Unit</th>
        <th>Sex</th>
        <th>Latitude</th>
        <th>Longitude</th>
        `
        queryTableContainer.appendChild(table)
        table.appendChild(trHeader)
    }

    // TODO: figure out what to do with these
    async function populateCountryDropdown() {
        const res = await fetch(`${apiBaseURL}country.json`)
        const data = await res.json()
 
        data.forEach(country => {
            let option = new Option(`${country.country}`, `${country.country}`)
            countrySelect.appendChild(option)
        })
    }

    async function populateSpeciesDropdown() {
        const res = await fetch(`${apiBaseURL}scientificName.json`)
        const data = await res.json()
 
        data.forEach(species => {
            let option = new Option(`${species.scientificName}`, `${species.scientificName}`)
            scientificNameSelect.appendChild(option)
        })
    }

    async function populateYearDropdown() {
        const res = await fetch(`${apiBaseURL}yearCollected.json`)
        const data = await res.json()
 
        data.forEach(year => {
            let option = new Option(`${year.yearCollected}`, `${year.yearCollected}`)
            yearSelect.appendChild(option)
        })
    }

    async function populateMeasurementTypeDropdown() {
        const res = await fetch(`${apiBaseURL}measurementType.json`)
        const data = await res.json()
  
        data.forEach(item => {
            let option = new Option(`${item.measurementType}`, `${item.measurementType}`)
            typeSelect.appendChild(option)
        })
    }
}