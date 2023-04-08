let name;
let person = "Todos";
let visibility = "message";
let messages;

document.querySelector('.home').addEventListener('keypress',function(e){clickToEnter(e)})
document.querySelector('.main').addEventListener('keypress',function(e){sendMessage(e)})

async function execultByInterval() {
    setInterval(keepOnline, 5000)
    setInterval(upDateMessages, 3000)
    setInterval(whosOnline, 10000)
}

function clickToEnter(event){
    if(event.key === 'Enter' || event.target.classList.contains('home-button')) {
        name = document.querySelector('.home-input').value
        if(name !== ''){
            axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', {name})
            .then(async () => {
                document.querySelector('.home').classList.add('hidden');
                document.querySelector('.main').classList.remove('hidden');
                messages = await getMessages()
                writeMessages(messages)
                whosOnline()
                await execultByInterval()
                scrollToEnd()
            })
            .catch(err => {
                if(err?.response?.status === 400){
                    let input = document.querySelector('.home-input')
                    input.value = ''
                    input.setAttribute('placeholder', 'Nome já utilizado')
                }
            })
        }
    }
}

function keepOnline(){
    axios.post('https://mock-api.driven.com.br/api/v6/uol/status', {name})
    .then()
    .catch(err => console.log(err))
}

function whosOnline(){
    axios.get('https://mock-api.driven.com.br/api/v6/uol/participants')
    .then(value => {
        let people = value.data
        let list = document.querySelector('.contact')
        list.innerHTML = 
            `<li class="Todos"  onclick="togglePerson(event)">
                <ion-icon name="people" class="icon"></ion-icon>
                Todos
                <ion-icon name="checkmark" class="checkmark"></ion-icon>
            </li>`
        people.map(value => {
            if(value.name !== name) {
                list.innerHTML += 
                `<li class="${value.name}"  onclick="togglePerson(event)">
                    <ion-icon name="person-circle" class="icon"></ion-icon>
                    ${value.name}
                    <ion-icon name="checkmark" class="checkmark"></ion-icon>
                </li>`
            }
        })

        if(!people.some(({name}) => name === person)) {
            person = 'Todos'
        }
        document.querySelector(`.${person}`).querySelector('.checkmark').classList.add('selectedPerson')
    })
    .catch(err => console.log(err))
}

function toggleVisibility(event) {
    if(person !== "Todos") {
        document.querySelector('.selectedVisibility').classList.remove('selectedVisibility')

        const t = event.target
        visibility = t.classList.value
        t.querySelector(".checkmark").classList.toggle('selectedVisibility')
    }
}

function togglePerson(event) {
    document.querySelector('.selectedPerson').classList.remove('selectedPerson')

    const t = event.target
    person = t.classList.value
    t.querySelector(".checkmark").classList.toggle('selectedPerson')

    if(person === "Todos" && visibility === "private_message") {
        document.querySelector('.selectedVisibility').classList.remove('selectedVisibility')
        
        visibility = 'message'
        document.querySelector('.message').querySelector('.checkmark').classList.toggle('selectedVisibility')
    }
}

async function getMessages(){
    const {data} = await axios.get('https://mock-api.driven.com.br/api/v6/uol/messages')
    return data
}

function writeMessages(chatMessages) {
    const chat = document.querySelector('.chat')

    chatMessages.map(message => {
        if(message.type === "status"){
            chat.innerHTML += 
            `<div class="individual-text status">
                <span>(${message.time})</span>
                <span class="bold">${message.from}</span>
                ${message.text}
            </div>`
        } if(message.type === 'message'){
            chat.innerHTML += 
            `<div class="individual-text message">
                <span>(${message.time})</span>
                <span class="bold">${message.from}</span>
                 para <span class="bold">${message.to}</span>
                 ${message.text}
            </div>`
        } if(message.type === 'private_message' && (
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
    const input = document.querySelector('.chat-input')
    if(event.key === 'Enter' && input.value !== '') {
        const message = {
            from: name,
            to: person,
            text: input.value,
            type: visibility
        }
        axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', message)
        .then(
            input.value = ''
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
    document.querySelector('.chat .individual-text:nth-last-child(1)').scrollIntoView();
}

function showModal(){
    document.querySelector(".modal").classList.toggle("hidden")
    document.querySelector(".modal-container").classList.toggle("hidden")
}