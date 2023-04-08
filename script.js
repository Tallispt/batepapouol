let name, messages;
let person = "Todos";
let visibility = "message";

const API_URL = "https://mock-api.driven.com.br/api/v6/uol/";

const home = document.querySelector(".home");
const homeInput = document.querySelector(".home-input");
const main = document.querySelector(".main");
const contact = document.querySelector(".contact");
const chat = document.querySelector(".chat");
const chatInput = document.querySelector(".chat-input");
const modal = document.querySelector(".modal");
const modalContainer = document.querySelector(".modal-container");

home.addEventListener("keypress",function(e){clickToEnter(e)})
main.addEventListener("keypress",function(e){sendMessage(e)})

async function execultByInterval() {
    setInterval(keepOnline, 5000)
    setInterval(upDateMessages, 3000)
    setInterval(whosOnline, 10000)
}

function clickToEnter(event){
    if(event.key === "Enter" || event.target.classList.contains("home-button")) {
        name = homeInput.value
        if(name !== ""){
            axios.post(API_URL + "participants", {name})
            .then(async () => {
                home.classList.add("hidden");
                main.classList.remove("hidden");
                messages = await getMessages()
                writeMessages(messages)
                whosOnline()
                await execultByInterval()
                scrollToEnd()
            })
            .catch(err => {
                if(err?.response?.status === 400){
                    homeInput.value = ""
                    homeInput.setAttribute("placeholder", "Nome já utilizado")
                }
            })
        }
    }
}

function keepOnline(){
    axios.post(API_URL + "status", {name})
    .then()
    .catch(err => console.log(err))
}

function whosOnline(){
    axios.get(API_URL + "participants")
    .then(({data}) => {
        contact.innerHTML = 
            `<li class="Todos"  onclick="togglePerson(event)">
                <ion-icon name="people" class="icon"></ion-icon>
                Todos
                <ion-icon name="checkmark" class="checkmark"></ion-icon>
            </li>`
        data.map(value => {
            if(value.name !== name) {
                contact.innerHTML += 
                `<li class="${value.name}"  onclick="togglePerson(event)">
                    <ion-icon name="person-circle" class="icon"></ion-icon>
                    ${value.name}
                    <ion-icon name="checkmark" class="checkmark"></ion-icon>
                </li>`
            }
        })

        if(!data.some(({name}) => name === person)) {
            person = "Todos"
        }
        document.querySelector(`.${person}`).querySelector(".checkmark").classList.add("selectedPerson")
    })
    .catch(err => console.log(err))
}

function toggleVisibility(event) {
    if(person !== "Todos") {
        document.querySelector(".selectedVisibility").classList.remove("selectedVisibility")

        const t = event.target
        visibility = t.classList.value
        t.querySelector(".checkmark").classList.toggle("selectedVisibility")
    }
}

function togglePerson(event) {
    document.querySelector(".selectedPerson").classList.remove("selectedPerson")

    const t = event.target
    person = t.classList.value
    t.querySelector(".checkmark").classList.toggle("selectedPerson")

    if(person === "Todos" && visibility === "private_message") {
        document.querySelector(".selectedVisibility").classList.remove("selectedVisibility")
        
        visibility = "message"
        document.querySelector(".message").querySelector(".checkmark").classList.toggle("selectedVisibility")
    }
}

async function getMessages(){
    const {data} = await axios.get(API_URL + "messages")
    return data
}

function writeMessages(chatMessages) {

    chatMessages.map(message => {
        if(message.type === "status"){
            chat.innerHTML += 
            `<div class="individual-text status">
                <span>(${message.time})</span>
                <span class="bold">${message.from}</span>
                ${message.text}
            </div>`
        } if(message.type === "message"){
            chat.innerHTML += 
            `<div class="individual-text message">
                <span>(${message.time})</span>
                <span class="bold">${message.from}</span>
                 para <span class="bold">${message.to}</span>
                 ${message.text}
            </div>`
        } if(message.type === "private_message" && (
            message.to === name || message.from === name
        )){
            chat.innerHTML += 
            `<div class="individual-text private-message">
                <span>(${message.time})</span>
                <span class="bold">${message.from}</span>
                 reservadamente para <span class="bold">${message.to}</span>
                ${message.text}
            </div>`
        }
    })
}

async function upDateMessages() {
    let newMessages = await getMessages()
                
    const list = newMessages.filter(newMessageValue => {
        return !messages.some(messagevalue => {
            return isTheSame(newMessageValue, messagevalue)
        })
    })

    if(list.length) {
        writeMessages(newMessages)
        messages = [...messages, ...newMessages]
        scrollToEnd()
    }
}

function sendMessage(event){
    if(event.key === "Enter" && chatInput.value !== "") {
        const message = {
            from: name,
            to: person,
            text: chatInput.value,
            type: visibility
        }
        axios.post(API_URL + "messages", message)
        .then(
            chatInput.value = ""
        )
        .catch(err => console.log(err))
    }
}

function isTheSame(a, b) { 
    return (a.type === b.type &&
        a.to === b.to &&
        a.from === b.from &&
        a.time === b.time)}

function scrollToEnd(){
    document.querySelector(".chat .individual-text:nth-last-child(1)").scrollIntoView();
}

function showModal(){
    modal.classList.toggle("hidden")
    modalContainer.classList.toggle("hidden")
}