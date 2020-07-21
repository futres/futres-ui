window.onload = function() {
    const apiBaseURL = 'https://raw.githubusercontent.com/futres/FutresAPI/master/data/'
    const projBaseURL = 'https://api.geome-db.org/projects/stats?includePublic=true'
    const scientificNameInput = document.getElementById('scientific-name-input')
    const typeSelect = document.getElementById('measurement-type-select')
    const yearSelect = document.getElementById('year-select')
    const countrySelect = document.getElementById('country-select')
    const chartSelect = document.getElementById('chart-select')

    const link = 'https://plantphenology.org/futresapi/v1/query/_search?pretty&from=0&size=5&q=scientificName=Puma+concolor'

    function idk() {
        fetch(link)
        .then(res => res.json())
        .then(data => console.log(data))
    }

    idk()

    /******************** 
        NAVIGATION 
    *********************/

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

    /******************** 
            MODAL 
    *********************/

    let modal = document.getElementById("detail-modal");
    let span = document.getElementsByClassName("close")[0];

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        }
    }

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
        // console.log(species);

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
                console.log(x);

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
                // console.log(project.projectId);
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
        QUERY PAGE 
    *********************/
    
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