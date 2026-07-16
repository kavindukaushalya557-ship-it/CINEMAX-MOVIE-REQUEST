/* ==========================================
   CINEMAX HD
   app.js - Part 1
========================================== */

"use strict";

/* ==========================================
   CONFIG
========================================== */

const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";

/* ==========================================
   FIREBASE CONFIG
========================================== */

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_PROJECT.firebaseapp.com",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_PROJECT.appspot.com",

  messagingSenderId: "YOUR_SENDER_ID",

  appId: "YOUR_APP_ID"

};

/* ==========================================
   FIREBASE INIT
========================================== */

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

/* ==========================================
   ELEMENTS
========================================== */

const movieForm = document.getElementById("movieForm");

const searchInput = document.getElementById("movieName");

const suggestionList = document.getElementById("suggestionsList");

const toast = document.getElementById("toast");

const backToTop = document.getElementById("backToTop");

/* ==========================================
   TOAST
========================================== */

function showToast(message, success = true) {

    toast.textContent = message;

    toast.style.borderLeftColor = success
        ? "#28a745"
        : "#e50914";

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/* ==========================================
   LOADING BUTTON
========================================== */

function setLoading(button, loading) {

    if (!button) return;

    if (loading) {

        button.classList.add("loading");

        button.disabled = true;

        button.innerHTML =
            `<i class="fas fa-spinner"></i> Please Wait...`;

    } else {

        button.classList.remove("loading");

        button.disabled = false;

        button.innerHTML =
            `<i class="fas fa-paper-plane"></i> Submit Request`;

    }

}

/* ==========================================
   FETCH JSON
========================================== */

async function fetchJSON(url) {

    try {

        const response = await fetch(url);

        if (!response.ok)
            throw new Error("Network Error");

        return await response.json();

    } catch (err) {

        console.error(err);

        showToast("Internet Connection Error", false);

        return null;

    }

}

/* ==========================================
   TMDB SEARCH
========================================== */

async function searchMovie(query) {

    if (!query) {

        suggestionList.innerHTML = "";

        suggestionList.style.display = "none";

        return;

    }

    const url =
        `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

    const data = await fetchJSON(url);

    if (!data) return;

    renderSuggestions(data.results || []);

}

/* ==========================================
   POSTER URL
========================================== */

function poster(path) {

    if (!path)
        return "assets/no-image.png";

    return TMDB_IMAGE + path;

}

/* ==========================================
   DATE FORMAT
========================================== */

function formatDate(date) {

    if (!date)
        return "-";

    return new Date(date)
        .toLocaleDateString();

}

/* ==========================================
   SCROLL BUTTON
========================================== */

window.addEventListener("scroll", () => {

    if (window.scrollY > 400) {

        backToTop.style.display = "flex";

    } else {

        backToTop.style.display = "none";

    }

});

backToTop.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});

/* ==========================================
   END PART 1
========================================== */
/* ==========================================
   APP.JS - PART 2
   TMDB Search + Voice Search
========================================== */

/* ==========================================
   LIVE SEARCH
========================================== */

searchInput.addEventListener("input", () => {

    const value = searchInput.value.trim();

    if (value.length < 2) {

        suggestionList.innerHTML = "";

        suggestionList.style.display = "none";

        return;

    }

    searchMovie(value);

});

/* ==========================================
   RENDER SUGGESTIONS
========================================== */

function renderSuggestions(results) {

    suggestionList.innerHTML = "";

    if (!results.length) {

        suggestionList.style.display = "none";

        return;

    }

    suggestionList.style.display = "block";

    results.slice(0,8).forEach(item => {

        const li = document.createElement("li");

        const title =
            item.title ||
            item.name ||
            "Unknown";

        const year =
            (item.release_date || item.first_air_date || "")
            .substring(0,4);

        li.innerHTML = `

        <img src="${poster(item.poster_path)}">

        <div class="sugg-info">

            <span class="sugg-title">

                ${title}

            </span>

            <span class="sugg-year">

                ${year}

            </span>

        </div>

        `;

        li.onclick = () => {

            fillMovie(item);

        };

        suggestionList.appendChild(li);

    });

}

/* ==========================================
   AUTO FILL
========================================== */

function fillMovie(movie) {

    searchInput.value =
        movie.title ||
        movie.name ||
        "";

    document.getElementById("year").value =
        (movie.release_date ||
        movie.first_air_date ||
        "").substring(0,4);

    suggestionList.innerHTML = "";

    suggestionList.style.display = "none";

}

/* ==========================================
   CLICK OUTSIDE
========================================== */

document.addEventListener("click",(e)=>{

    if(!e.target.closest(".movie-search")){

        suggestionList.style.display="none";

    }

});

/* ==========================================
   VOICE SEARCH
========================================== */

const voiceBtn =
document.getElementById("voiceBtn");

if(

'webkitSpeechRecognition' in window ||

'SpeechRecognition' in window

){

const SpeechRecognition=

window.SpeechRecognition ||

window.webkitSpeechRecognition;

const recognition=

new SpeechRecognition();

recognition.lang="en-US";

recognition.interimResults=false;

recognition.maxAlternatives=1;

voiceBtn.addEventListener("click",()=>{

recognition.start();

voiceBtn.innerHTML=

'<i class="fas fa-microphone-slash"></i>';

});

recognition.onresult=(event)=>{

const text=

event.results[0][0].transcript;

searchInput.value=text;

searchMovie(text);

showToast("Voice Search Success");

};

recognition.onerror=()=>{

showToast("Voice Search Failed",false);

};

recognition.onend=()=>{

voiceBtn.innerHTML=

'<i class="fas fa-microphone"></i>';

};

}else{

voiceBtn.style.display="none";

}

/* ==========================================
   ENTER SEARCH
========================================== */

searchInput.addEventListener(

"keypress",

(e)=>{

if(e.key==="Enter"){

e.preventDefault();

searchMovie(

searchInput.value

);

}

}

/* ==========================================
   END PART 2
========================================== */
);
/* ==========================================
   APP.JS - PART 3
   Firebase Submit + Live Requests
========================================== */

/* ==========================================
   SUBMIT REQUEST
========================================== */

movieForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const submitBtn = document.querySelector(".submit-btn");

    setLoading(submitBtn, true);

    try {

        const data = {

            name: document.getElementById("fullName").value.trim(),

            whatsapp: document.getElementById("waNumber").value.trim(),

            movie: document.getElementById("movieName").value.trim(),

            language: document.getElementById("language").value,

            year: document.getElementById("year").value,

            type: document.getElementById("requestType").value,

            status: "Pending",

            createdAt: firebase.firestore.FieldValue.serverTimestamp()

        };

        if (!data.movie || !data.whatsapp) {

            showToast("Please fill all required fields.", false);

            setLoading(submitBtn, false);

            return;

        }

        await db.collection("requests").add(data);

        showToast("Request submitted successfully!");

        movieForm.reset();

    } catch (err) {

        console.error(err);

        showToast("Failed to submit request.", false);

    }

    setLoading(submitBtn, false);

});

/* ==========================================
   LOAD REQUESTS
========================================== */

const requestContainer =
document.getElementById("requestContainer");

function loadRequests() {

    db.collection("requests")

    .orderBy("createdAt", "desc")

    .onSnapshot(snapshot => {

        requestContainer.innerHTML = "";

        snapshot.forEach(doc => {

            createRequestCard({

                id: doc.id,

                ...doc.data()

            });

        });

    });

}

/* ==========================================
   CREATE REQUEST CARD
========================================== */

function createRequestCard(data) {

    const card =
    document.createElement("div");

    card.className =
    "request-card-item";

    card.dataset.type =
    data.type.toLowerCase();

    card.dataset.status =
    data.status.toLowerCase();

    card.innerHTML = `

        <img
            src="assets/no-image.png"
            class="request-poster">

        <div class="request-content">

            <h3>

                ${data.movie}

            </h3>

            <div class="request-meta">

                <span>

                    📅 ${data.year || "-"}

                </span>

                <span>

                    ${data.language}

                </span>

            </div>

            <span class="status ${data.status.toLowerCase()}">

                ${data.status}

            </span>

        </div>

    `;

    requestContainer.appendChild(card);

}

/* ==========================================
   SEARCH FILTER
========================================== */

const searchRequest =
document.getElementById("searchRequest");

searchRequest.addEventListener("keyup", () => {

    const value =
    searchRequest.value.toLowerCase();

    document
    .querySelectorAll(".request-card-item")

    .forEach(card => {

        const title =
        card.querySelector("h3")

        .textContent

        .toLowerCase();

        card.style.display =

        title.includes(value)

        ? "block"

        : "none";

    });

});

/* ==========================================
   CATEGORY FILTER
========================================== */

document

.querySelectorAll(".filter-btn")

.forEach(btn => {

btn.addEventListener("click", () => {

document

.querySelectorAll(".filter-btn")

.forEach(x =>

x.classList.remove("active")

);

btn.classList.add("active");

const filter =
btn.dataset.filter;

document

.querySelectorAll(".request-card-item")

.forEach(card => {

if (

filter === "all"

) {

card.style.display = "block";

return;

}

if (

filter === "completed"

) {

card.style.display =

card.dataset.status ===

"completed"

? "block"

: "none";

return;

}

card.style.display =

card.dataset.type === filter

? "block"

: "none";

});

});

});

/* ==========================================
   START
========================================== */

loadRequests();

/* ==========================================
   END PART 3
========================================== */
/* ==========================================
   APP.JS - PART 4
   Movie Details Modal (TMDB)
========================================== */

const modal = document.getElementById("movieModal");
const closeModal = document.getElementById("closeModal");

const modalPoster = document.getElementById("modalPoster");
const modalTitle = document.getElementById("modalTitle");
const modalRating = document.getElementById("modalRating");
const modalPlot = document.getElementById("modalPlot");
const modalTrailer = document.getElementById("modalTrailer");

/* ==========================================
   OPEN MODAL
========================================== */

async function openMovieModal(movieName){

    try{

        const url=
`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}`;

        const data=await fetchJSON(url);

        if(!data || !data.results.length){

            showToast("Movie not found",false);
            return;

        }

        const movie=data.results[0];

        modalPoster.src=poster(movie.poster_path);

        modalTitle.textContent=movie.title;

        modalRating.textContent=
movie.vote_average || "N/A";

        modalPlot.textContent=
movie.overview || "No description available.";

        /* Trailer */

        const trailerURL=
`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`;

        const trailerData=
await fetchJSON(trailerURL);

        modalTrailer.src="";

        if(trailerData && trailerData.results){

            const trailer=

trailerData.results.find(video=>

video.site==="YouTube" &&

video.type==="Trailer"

);

            if(trailer){

modalTrailer.src=

`https://www.youtube.com/embed/${trailer.key}`;

            }

        }

        modal.style.display="flex";

        document.body.style.overflow="hidden";

    }

    catch(err){

        console.error(err);

        showToast("Failed to load movie",false);

    }

}

/* ==========================================
   CLOSE MODAL
========================================== */

closeModal.onclick=()=>{

modal.style.display="none";

modalTrailer.src="";

document.body.style.overflow="auto";

};

window.onclick=(e)=>{

if(e.target===modal){

modal.style.display="none";

modalTrailer.src="";

document.body.style.overflow="auto";

}

};

/* ==========================================
   CARD CLICK
========================================== */

requestContainer.addEventListener(

"click",

(e)=>{

const card=

e.target.closest(".request-card-item");

if(!card) return;

const title=

card.querySelector("h3").textContent;

openMovieModal(title);

});

/* ==========================================
   ESC KEY
========================================== */

document.addEventListener(

"keydown",

(e)=>{

if(

e.key==="Escape" &&

modal.style.display==="flex"

){

modal.style.display="none";

modalTrailer.src="";

document.body.style.overflow="auto";

}

});

/* ==========================================
   END PART 4
========================================== */
/* ==========================================
   APP.JS - PART 5
   Theme + Animations + UI
========================================== */

/* ==========================================
   THEME TOGGLE
========================================== */

const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme");

if(savedTheme === "light"){

    document.body.classList.add("light-mode");

    themeToggle.innerHTML =
    '<i class="fas fa-sun"></i>';

}

themeToggle.addEventListener("click",()=>{

    document.body.classList.toggle("light-mode");

    const light =
    document.body.classList.contains("light-mode");

    localStorage.setItem(
        "theme",
        light ? "light" : "dark"
    );

    themeToggle.innerHTML = light
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';

});

/* ==========================================
   MOBILE MENU
========================================== */

const mobileMenu =
document.getElementById("mobileMenu");

const navMenu =
document.querySelector(".nav-menu");

mobileMenu.addEventListener("click",()=>{

    navMenu.classList.toggle("active");

});

/* ==========================================
   PRELOADER
========================================== */

window.addEventListener("load",()=>{

    const loader =
    document.getElementById("preloader");

    loader.classList.add("hide-loader");

    setTimeout(()=>{

        loader.remove();

    },700);

});

/* ==========================================
   COUNTER ANIMATION
========================================== */

const counters =
document.querySelectorAll(".counter");

const observer =
new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

const counter = entry.target;

const target =
+counter.dataset.target;

let current = 0;

const increment =
target / 120;

const update = ()=>{

current += increment;

if(current < target){

counter.textContent =
Math.floor(current);

requestAnimationFrame(update);

}else{

counter.textContent =
target.toLocaleString();

}

};

update();

observer.unobserve(counter);

}

});

});

counters.forEach(counter=>{

observer.observe(counter);

});

/* ==========================================
   CONFETTI
========================================== */

movieForm.addEventListener("submit",()=>{

if(typeof confetti !== "undefined"){

confetti({

particleCount:120,

spread:90,

origin:{y:0.6}

});

}

});

/* ==========================================
   SMOOTH LINKS
========================================== */

document

.querySelectorAll('a[href^="#"]')

.forEach(link=>{

link.addEventListener("click",(e)=>{

const target =

document.querySelector(

link.getAttribute("href")

);

if(target){

e.preventDefault();

target.scrollIntoView({

behavior:"smooth"

});

}

});

});

/* ==========================================
   ACTIVE NAV LINK
========================================== */

const sections =
document.querySelectorAll("section");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(section=>{

const top =
section.offsetTop-120;

if(window.scrollY>=top){

current = section.id;

}

});

document

.querySelectorAll(".nav-menu a")

.forEach(link=>{

link.classList.remove("active");

if(

link.getAttribute("href")

==="#"+current

){

link.classList.add("active");

}

});

});

/* ==========================================
   END PART 5
========================================== */
/* ==========================================
   APP.JS - PART 6
   Favorites + Share + PWA + Offline
========================================== */

/* ==========================================
   FAVORITES (LocalStorage)
========================================== */

let favorites = JSON.parse(
    localStorage.getItem("favorites")
) || [];

function saveFavorites() {
    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );
}

function toggleFavorite(movieName) {

    const index = favorites.indexOf(movieName);

    if (index === -1) {

        favorites.push(movieName);

        showToast("Added to Favorites ❤️");

    } else {

        favorites.splice(index, 1);

        showToast("Removed from Favorites");

    }

    saveFavorites();

}

/* ==========================================
   SHARE MOVIE
========================================== */

async function shareMovie(movieName){

    if(navigator.share){

        try{

            await navigator.share({

                title:"CINEMAX HD",

                text:`Check this movie: ${movieName}`,

                url:window.location.href

            });

        }

        catch(err){

            console.log(err);

        }

    }

    else{

        navigator.clipboard.writeText(

window.location.href

        );

        showToast(

"Link copied to clipboard"

        );

    }

}

/* ==========================================
   OFFLINE DETECTION
========================================== */

window.addEventListener("offline",()=>{

showToast(

"No Internet Connection",

false

);

});

window.addEventListener("online",()=>{

showToast(

"Back Online"

);

});

/* ==========================================
   PWA INSTALL
========================================== */

let deferredPrompt;

window.addEventListener(

"beforeinstallprompt",

(e)=>{

e.preventDefault();

deferredPrompt=e;

const installBtn=

document.createElement("button");

installBtn.className="install-btn";

installBtn.innerHTML=

'<i class="fas fa-download"></i> Install App';

document.body.appendChild(installBtn);

installBtn.onclick=async()=>{

installBtn.remove();

deferredPrompt.prompt();

const result=

await deferredPrompt.userChoice;

console.log(result.outcome);

deferredPrompt=null;

};

});

/* ==========================================
   SERVICE WORKER
========================================== */

if(

"serviceWorker" in navigator

){

window.addEventListener(

"load",

()=>{

navigator.serviceWorker

.register("service-worker.js")

.then(()=>{

console.log(

"Service Worker Registered"

);

})

.catch(console.error);

});

}

/* ==========================================
   PAGE VISIBILITY
========================================== */

document.addEventListener(

"visibilitychange",

()=>{

if(document.hidden){

console.log(

"User Left Page"

);

}else{

console.log(

"User Returned"

);

}

});

/* ==========================================
   APP START
========================================== */

console.log(

"%c CINEMAX HD Loaded",

"color:#FFD700;font-size:18px;font-weight:bold;"

);

showToast(

"Welcome to CINEMAX HD"

);

/* ==========================================
   END OF FILE
========================================== */
