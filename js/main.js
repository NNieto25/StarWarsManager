/**
 * Función para cambiar las clases del contenedor dinámicamente y añardir/eliminar personas
 */
const containerListener = document.addEventListener("click", e => {
const target = e.target; 

    if (target.classList.contains("button-expander")
    || target.classList.contains("fa-plus")) {

    activeCard();
    //Contenedor a mostrar
    const exp = target.closest(".card").querySelector(".people-container");
    //Para que solo se despliegue el contenedor de la card activa
    const active = target.closest(".card");

    if (!active.classList.contains("inactive")){
    active.classList.add("active");
    }

    const cards = document.querySelectorAll(".card:not(.active)");
    for (i=0; i<cards.length; i++){
        cards[i].classList.add("inactive");
    }

  //Cambia la clase "is-collapsed" por "is-expanded" para mostrarlo
    if (exp.classList.contains("is-collapsed") && !active.classList.contains("this")) {
        page = 0;
        displayPeopleCards(people, exp, page);
        exp.classList.replace("is-collapsed", "is-expanded");
        
    }
  //Cambia la clase "is-expanded" por "is-collapsed" para ocultarlo
    else if (exp.classList.contains("is-expanded") || active.classList.contains("this")) {
    exp.classList.replace("is-expanded", "is-collapsed");
    active.classList.remove("active");
    active.classList.remove("this");

        for (i=0; i<cards.length; i++){
            cards[i].classList.remove("inactive");
        }
    }
}
});

/**
 * Función para cerrar card activa
 */
const activeCard = () => {
    const these = document.querySelectorAll(".this");
    for (i=0; i<these.length; i++){
        these[i].classList.remove("this");
    }

    const act = document.querySelector(".active");
    
    if (act != null && !act.classList.contains("this")) {
    const exp = act.closest(".card").querySelector(".people-container");
    exp.classList.replace("is-expanded", "is-collapsed");
    act.classList.remove("active");
    act.classList.add("this");

    const cards = document.querySelectorAll(".card");
    for (i=0; i<cards.length; i++){
        cards[i].classList.remove("inactive");
    }
    }
}

//Obtención de datos de la API
const starWarsAPI = "https://swapi.dev/api/";
const peopleEndPoint = "people/";
const starShipEndPoint = "starships/";
let starshipsIds = 0;
let peopleIds = 0;
let page = 0;
let searchResults = [];
let starShips = [];
let people = [];

/**
 * Funcion para obtener datos a partir de la API
 * @param {string} baseAPI API en la que se solicitan los datos
 * @param {string} endpoint  endpoint especifico de la api
 * @param {number} amount cantidad de registros que se desea obtener
 */
const getData = async (baseAPI, endpoint,amount) => {
    const innerArray = [];
    const urls = [];
    const pages = Math.ceil(amount/10);
    for(let i = 1; i <= pages; i++){
        urls.push(baseAPI + endpoint +"?page=" +  i);
    }
    await Promise.all(urls.map(url => fetchData(url, innerArray)));
    return innerArray;
}

/**
 * Funcion para convertir un objeto a uno con menos propiedades
 * para utilizar solo datos necesarios en la aplicacion
 * @param {object} obj objeto a simplificar
 */
const parseObject = (obj) => {
    if (obj.model == undefined) {
        const person = {
            name: obj.name,
            id: (peopleIds<82? peopleIds++ : undefined),
            height: obj.height,
            mass: obj.mass,
            gender: obj.gender,
            included: false
        };
        return person;
    }
    else{
        const starship = {
            name : obj.name,
            id : (starshipsIds<36? ++starshipsIds : starShips.find(ss => ss.name == obj.name).id),
            model : obj.model,
            crew : obj.crew,
            onBoard: [],
            consumables: obj.consumables
        }
        return starship;
    }
};

/**
 * Funcion para crear tarjeta de una nave
 * @param {object} starship objeto que contiene los datos de una nave
 */
const createStarshipCard = (starship) => {
    const element = document.createElement("div");
    element.classList.add("card");

    const content = `
    <div class="card-starship">
    <h3>${starship.name}</h3>
    <hr>
    <div class="card-starship-details">
        <dl>
            <dt>Model</dt>
            <dd>
                ${starship.model}
            </dd>
            <dt>Starship crew</dt>
            <dd>
                ${starship.crew}
            </dd>
            <dt>Consumables</dt>
            <dd>
                ${starship.consumables}
            </dd>
        </dl>
        <button type="button" class="button-expander">
            <i class="fas fa-plus"></i>
        </button>
    </div>
    </div>
    <section class="people-container is-collapsed">
        <div class="triangle"></div>
        <header class="crew">
            <h4>
            <i class="fas fa-users"></i> Crew
            </h4>
            <hr>
        </header>
        <button type="button" class="button left">
        <i class="fas fa-angle-left"></i>
        </button>
        <div data-stars='${JSON.stringify(starship)}' class="people-cards-container">
        </div>
        <button type="button" class="button right">
            <i class="fas fa-angle-right"></i>
        </button>
    </section>
    `;
    element.innerHTML = content;
    return element;
}

/**
 * Funcion para crear tarjeta de un personaje
 * @param {object} person objeto que contiene los datos de un personaje
 */
const createPersonCard = (person) => {
    const element = document.createElement("div");
    element.classList.add("card-people");
    const content = `
        <div class="card-heading">
            <h5>${person.name}</h5>
            <hr>
        </div>
        <div class="card-people-details">
            <ul>
                <li><span>Height:</span> ${person.height} </li>
                <li><span>Mass:</span> ${person.mass}</li>
                <li><span>Gender:</span> ${person.gender}</li>
            </ul>
            <button data-person='${JSON.stringify(person)}' type="button" class="button-people-add">
                <i data-person='${JSON.stringify(person)}' class="fas fa-plus-circle"></i>
            </button>
        </div>
    `;
    element.innerHTML = content;
    return element;
};

/**
 * Muestra las naves en la vista
 * @param {object : Array} starships arreglo de naves 
 */
const displayStarshipsCards = (starships) => {
    const container = document.querySelector(".starships-container");
    container.innerHTML = '';
    starships.forEach(starship => {
        const starshipCard = createStarshipCard(starship);
        container.appendChild(starshipCard);
    });
}

/**
 * Funcion para mostrar tarjetas de personajes en la vista
 * @param {object: Array} peopleArray arreglo de personajes 
 */
const displayPeopleCards = (peopleArray, container,innerPage) => {
    const cardsContainer = container.querySelector('.people-cards-container');
    cardsContainer.innerHTML= '';
    const min = (innerPage * 10) ;
    const max = min + 9;
    let starshipId = JSON.parse(cardsContainer.dataset.stars).id;
    const starship = starShips.find((e) => e.id == starshipId);
    const innerArray = peopleArray.filter(person => (person.id >= min && person.id <= max));
    innerArray.forEach(person => {
        const personCard = createPersonCard(person);
        if (person.included && starship.onBoard.includes(person.id)) {
            personCard.classList.remove("included");
            const icon = personCard.querySelector(".card-people-details").querySelector("button").querySelector("i");
            icon.classList.replace("fa-plus-circle","fa-minus-circle");
            
        }
        else if (person.included) {
            personCard.classList.add("included");
            const button = personCard.querySelector(".card-people-details").querySelector("button");
            personCard.querySelector(".card-people-details").removeChild(button);
        }
        if (starship.onBoard.includes(person.id)) {
            personCard.classList.add("added");
        }
        cardsContainer.appendChild(personCard);
    });
}

/**
 * Función para buscar una nave específica
 * @param {string} baseAPI API de la cual se solicitan los datos
 * @param {string} endpoint Endpoint específico de la API (starships/people)
 * @param {string} query Cadena de texto a buscar
 */
const search = async (baseAPI, endpoint, query) => {
    let pageSearch = 1;
    const urls = [];
    let count = await fetch(baseAPI + endpoint + "?" +query)
                .then(response => response.json())
                .then(data => Math.ceil(data.count/10));
    while(pageSearch != count + 1){
        const url = baseAPI + endpoint + "?page=" + pageSearch++ + "&" + query;
        urls.push(url);
    }
    const promiseArray = urls.map(url => fetchData(url,searchResults));
    return Promise.all(promiseArray);
};

/**
 * Función para obtener los resultados de la búsqueda
 * @param {string} url URL 
 * @param {object: array} array 
 */
const fetchData = async (url,array) => {
    const response = await fetch(url);
    if (response.ok) {
        const data = await response.json();        
        data.results.forEach(rawObject => {
        array.push(parseObject(rawObject));
        });    
    }
};

/**
 * Listener que detecta el clic sobre el botón de búsqueda
 */
const searchStarshipListener = async () =>{
    document.forms.search.addEventListener('submit', async (e) =>{
        e.preventDefault();
        const input = document.querySelector('input');
        const query = "search="+input.value;
        await search(starWarsAPI,starShipEndPoint,query);
        searchResults.forEach(ss => {
            if (ss.onBoard.length == 0) {
                ss.onBoard = starShips.find(starship => starship.id == ss.id).onBoard;
            }
        });
        displayStarshipsCards(searchResults);
        nextPageListener();
        prevPageListener();
        searchResults.length=0;
    });
};

/**
 * Listener que detecta un clic sobre alguno de los botones de las cartas de personas (agregar o eliminar)
 */
const addOrRemoveListener = () => document.addEventListener("click", e => {
    let target = e.target;

    if ((target.classList.contains("button-people-add") 
    || target.classList.contains("fa-plus-circle")) 
    && !target.closest(".card-people").classList.contains("added")){
        addPerson(target);

    //Eliminar de disponibles
    }
    else if ((target.classList.contains("button-people-remove") 
    || target.classList.contains("fa-minus-circle")) 
    && target.closest(".card-people").classList.contains("added")) {
        removePerson(target);
    }   
});

/**
 * Función para agregar la persona seleccionada a la nave
 * @param {event target} target 
 */
const addPerson = (target) => {
    let personId = JSON.parse(target.dataset.person).id;
    target.closest(".card-people").classList.add("added");
    const container = target.closest(".card").querySelector(".people-cards-container");

    let starship = JSON.parse(container.dataset.stars);
    const key = starship.name;
    const id = JSON.parse(localStorage.getItem(key)).id;
    starShips[id-1].onBoard.push(personId);
    
    const person = people.find((e) => e.id == personId);
    person.included = true;

    if(target.classList.contains("button-people-add")){
        target.classList.replace("button-people-add", "button-people-remove");
        target.querySelector("i").replace("fa-plus-circle", "fa-minus-circle");
    }
    else{
    target.closest("button").classList.replace("button-people-add", "button-people-remove");
    target.classList.replace("fa-plus-circle", "fa-minus-circle");
    }
}

/**
 * Función para eliminar la persona  de la nave a la persona seleccionada
 * @param {event target} target 
 */
const removePerson = (target) => {
    let personId = JSON.parse(target.dataset.person).id;
    const person = people.find((e) => e.id == personId);
    target.closest(".card-people").classList.remove("added");
    const container = target.closest(".card").querySelector(".people-cards-container");

    let starshipId = JSON.parse(container.dataset.stars).id;
    const starship = starShips.find((e) => e.id == starshipId);
    const index = starship.onBoard.findIndex((e) => e == personId);

    starShips[starship.id-1].onBoard.splice(index, 1);
    person.included = false;

    if(target.classList.contains("button-people-remove")){
        target.classList.replace("button-people-remove", "button-people-add");
        target.querySelector("i").classList.replace("fa-minus-circle", "fa-plus-circle");
    }
    else{
    target.closest("button").classList.replace("button-people-remove", "button-people-add");
    target.classList.replace("fa-minus-circle", "fa-plus-circle");
    }
}

/**
 * Listener del botón para mostrar la siguiente página en el contenedor de personas
 */
const nextPageListener = () => {
    document.querySelectorAll(".right").forEach(element => element.addEventListener("click", e => {
        ++page;
        page %= 9;
        displayPeopleCards(people,e.target.parentNode.parentNode,page);
    }));
}

/**
 * Listener del botón para mostrar la página previa en el contenedor de personas
 */
const prevPageListener = () => {
    document.querySelectorAll(".left").forEach(element => element.addEventListener("click", e => {
        page += 8;
        page %= 9;
        displayPeopleCards(people,e.target.parentNode.parentNode,page);
    }));
}

const saveStarshipsData = (arrayData) => {
    arrayData.forEach(pair => localStorage.setItem(pair.name, JSON.stringify(pair)));
};

/**
 * Función para agregar los listeners de eventos
 */
const addListeners = () => {
    searchStarshipListener();
    nextPageListener();
    prevPageListener();
    addOrRemoveListener();
};
/**
 * Funcion que define el comportamiento de la aplicacion
 */
const app = async () => {
    starShips = await getData(starWarsAPI,starShipEndPoint,40);
    displayStarshipsCards(starShips);
    saveStarshipsData(starShips);
    people = await getData(starWarsAPI,peopleEndPoint,82);
    addListeners();
};

window.onload = app;
