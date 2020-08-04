window.onload = function() {
    const apiBaseURL = 'https://raw.githubusercontent.com/futres/FutresAPI/master/data/'
    //const projBaseURL = 'https://api.geome-db.org/projects/stats?includePublic=true'
    const projBaseURL = 'https://raw.githubusercontent.com/futres/FutresAPI/master/data/projects.json'
    const scientificNameSelect = document.getElementById('scientific-name-select')
    const typeSelect = document.getElementById('measurement-type-select')
    const yearSelect = document.getElementById('year-select')
    const countrySelect = document.getElementById('country-select')
    const chartSelect = document.getElementById('chart-select')
    const numberSelect = document.getElementById('number-results')
    const mapRadio = document.getElementById('radio-map')
    const tableRadio = document.getElementById('radio-table')
    const mapContainer = document.getElementById('map-container')
    const queryTableContainer = document.getElementById('query-table-container')

    /******************** 
      MAPPING FUNCTIONS
    *********************/
    let map = L.map('map', {
        minZoom: 2,
        maxZoom: 25
    })

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

    /******************** 
        NAVIGATION 
    *********************/

    const browseBtn = document.getElementById('browse-nav')
    const queryNav = document.getElementById('query-nav')
    const homeNav = document.getElementById('home-nav')

    homeNav.addEventListener('click', function() {
        queryNav.classList.remove('nav-btn')
        browseBtn.classList.remove('nav-btn')
        homeNav.classList.add('nav-btn')
        openPage('home-tab')
    })

    browseBtn.addEventListener('click', function() {
        queryNav.classList.remove('nav-btn')
        homeNav.classList.remove('nav-btn')
        browseBtn.classList.add('nav-btn')
        openPage('browse-tab')
    })

    queryNav.addEventListener('click', function() {
        browseBtn.classList.remove('nav-btn')
        homeNav.classList.remove('nav-btn')
        queryNav.classList.add('nav-btn')
        openPage('query-tab')
        addMapBaseLayer()
    })

    /******************** 
        BROWSE TAB 
    *********************/

    fetchProjects()
    countryTableData()
    speciesTableData()
    yearCollectedTableData()
    measurementTypeTableData()

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

    async function getSpecies() {
        const res = await fetch(`${apiBaseURL}scientificName.json`)
        const data = await res.json()

        let scientificName = []
        let values = []
        let obj = []

        data.forEach(species => {
            let option = new Option(`${species.scientificName}`, `${species.scientificName}`)
            scientificNameSelect.appendChild(option)
            scientificName.push(species.scientificName)
            values.push(species.value)
            obj.push(species)
        })
        return { scientificName, values, obj }
    }

    async function showSpeciesChart() {
        const data = await getSpecies()
        makeBarChart(data.scientificName, 'Species By Scientific Name', data.values)
    }

    async function speciesTableData() {
        const data = await getSpecies()
        let species = data.obj

        species.forEach(x => {
            const speciesTable = document.getElementById('species-table')
            let tr = document.createElement('tr')

            tr.innerHTML = `
            <td>${x.scientificName}</td>
            <td>${x.value}</td>
            `

            speciesTable.appendChild(tr)
        })
    }

    async function getMeasurementType() {
        const res = await fetch(`${apiBaseURL}measurementType.json`)
        const data = await res.json()

        let type = []
        let values = []
        let obj = []

        data.forEach(item => {
            let option = new Option(`${item.measurementType}`, `${item.measurementType}`)
            typeSelect.appendChild(option)
            type.push(item.measurementType)
            values.push(item.value)
            obj.push(item)
        })
        return { type, values, obj }
    }

    async function showMeasurementTypeChart() {
        const data = await getMeasurementType()
        makeBarChart(data.type, 'Measurement Types', data.values)
    }

    async function measurementTypeTableData() {
        const data = await getMeasurementType()
        let types = data.obj

        types.forEach(x => {
            const typesTable = document.getElementById('measure-table')
            let tr = document.createElement('tr')

            tr.innerHTML = `
            <td>${x.measurementType}</td>
            <td>${x.value}</td>
            `
            typesTable.appendChild(tr)
        })
    }

    async function getYearCollected() {
        const res = await fetch(`${apiBaseURL}yearCollected.json`)
        const data = await res.json()

        let yearCollected = []
        let values = []
        let obj = []

        data.forEach(year => {
            let option = new Option(`${year.yearCollected}`, `${year.yearCollected}`)
            yearSelect.appendChild(option)
            yearCollected.push(year.yearCollected)
            values.push(year.value)
            obj.push(year)
        })
        return { yearCollected, values, obj }
    }

    async function showYearCollectedChart() {
        const data = await getYearCollected()
        makeBarChart(data.yearCollected, 'Year Collected', data.values)
    }

    async function yearCollectedTableData() {
        const data = await getYearCollected()
        let years = data.obj

        years.forEach(x => {
            const yearTable = document.getElementById('year-table')
            let tr = document.createElement('tr')

            tr.innerHTML = `
            <td>${x.yearCollected}</td>
            <td>${x.value}</td>
            `
            yearTable.appendChild(tr)
        })
    }

    async function getCountry() {
        const res = await fetch(`${apiBaseURL}country.json`)
        const data = await res.json()
        let countries = []
        let values = []
        let obj = []

        data.forEach(country => {
            let option = new Option(`${country.country}`, `${country.country}`)
            countrySelect.appendChild(option)
            countries.push(country.country)
            values.push(country.value)
            obj.push(country)
        })
        return {countries, values, obj}
    }

    async function countryTableData() {
        const data = await getCountry()
        let countries = data.obj

        countries.forEach(x => {
            const countryTable = document.getElementById('country-table')
            let tr = document.createElement('tr')

            tr.innerHTML = `
            <td>${x.country}</td>
            <td>${x.value}</td>
            `

            countryTable.appendChild(tr)
        })
    }

    async function showCountriesChart() {
        const data = await getCountry()
        makeBarChart(data.countries, 'Countries', data.values)
    }


    async function speciesByProjId(id) {
        const res = await fetch(`${apiBaseURL}scientificName_projectId_${id}.json`)
        if(res.status == 200) {
            const data = await res.json()

            data.forEach(x => {

                let modalTable = document.getElementById('modal-table')
                let tr = document.createElement('tr')

                tr.innerHTML = `
                <td>${x.scientificName}</td>
                <td>${x.value}</td>
                `

                modalTable.appendChild(tr)
            })
        } else {
            throw new Error(res.status)
        }
    }

    // PROJECTS TABLE
    async function fetchProjects() {
        const res = await fetch(projBaseURL)
        const data = await res.json()


        let targetId = []
        // console.log(targetId, '<---- in the array')

        data.forEach(project => {
            if (project.projectConfiguration.id == 70 && project.discoverable == true && project.entityStats.DiagnosticsCount > 0) {
                let arr = project.projectTitle.split('_').toString()
                let noCommas = arr.replace(/,/g, ' ')
                let title = noCommas.replace(/FuTRES/g, '')

                let checkPI = () => {
                    if (project.principalInvestigator == null || '') {
                        return 'None Listed'
                    } else {
                        return project.principalInvestigator
                    }
                }

                let checkAffiliation = () => {
                    if(project.principalInvestigatorAffiliation == null || '') {
                        return 'None Listed'
                    } else {
                        return project.principalInvestigatorAffiliation
                    }
                }
                
                const projectsTable = document.getElementById('project-table')
                let tr = document.createElement('tr')

                tr.addEventListener('click', function() {
                    targetId.push(project.projectId)
                    modal.style.display = "block"
                    buildModalTable('modal-table-container', 'modal-table')
                    speciesByProjId(project.projectId)

                    // console.log('id clicked on:', project.projectId)
                })


                tr.innerHTML = `
                <td>${title}</td>
                <td>${checkPI()}</td>
                <td>${checkAffiliation()}</td>
                <td>${project.entityStats.DiagnosticsCount}</td>
                `
                projectsTable.appendChild(tr)
            }
        })
    }

    /******************** 
            MODAL 
    *********************/

   let modal = document.getElementById("detail-modal");
   let span = document.getElementsByClassName("close")[0];

   span.onclick = function() {
       modal.style.display = "none";
    //    removePreviousTr('modal-table')
    removeTable('modal-table')
   }

   window.onclick = function(event) {
   if (event.target == modal) {
       modal.style.display = "none";
       }
   }

    /******************** 
        OTHER FUNCTIONS 
    *********************/

    // Tab Toggle
    function openPage(pageName) {
        let tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
        }
        // Show the specific tab content
        document.getElementById(pageName).style.display = "flex";
      }

    // Accordion - Collapsible
    let coll = document.getElementsByClassName("collapsible-button");

    for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        let content = this.nextElementSibling;

        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        } 
    });
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

    //Build modal table
    function buildModalTable(containerId, tableId) {
        const containerDiv = document.getElementById(containerId)
        let table = document.createElement('table')
        table.id = tableId
        let headerTr = document.createElement('tr')
        headerTr.innerHTML = `
        <th>Species</th>
        <th>Count</th>
        `
        table.appendChild(headerTr)
        containerDiv.appendChild(table)
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

    //Generic Horizontal Bar Chart
    async function makeBarChart(xAxisLabels, title, values) {
        const purple = 'rgba(153, 102, 255, 0.2)'
        const darkerPurple = 'rgba(153, 102, 255, 1)'
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
                barThickness: 6,
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

    function removePreviousChart() {
        if(window.barChart != null) {
            window.barChart.destroy()
        }
    }
}
