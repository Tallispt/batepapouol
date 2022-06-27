let name;

function clickToEnter(){
    name = { name: document.querySelector('.home-input').value}
    if(name !== ''){
        let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', name)
        promise
        .then(response => {
            document.querySelector('.home').classList.add('hidden');
            document.querySelector('.main').classList.remove('hidden');
            setInterval(keepOnline, 5000)
            setInterval(getMessages, 3000)
            setInterval(whosOnline, 10000)
        })
        .catch(err => {
            if(error.response.status === 400){
                let input = document.querySelector('.home-input')
                input.value = ''
                input.setAttribute('placeholder', 'Nome já utilizado')
            }
        })
    }
}

function keepOnline(){
    let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', name)
    promise
    .then()
    .catch(err => console.log(err))
}

function whosOnline(){
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants')
    promise.then(value => {
        let people = value.data
        let list = document.querySelector('.contact')
        for(let i=0; i<people.length; i++){
            list.innerHTML += 
            `<li>
                <ion-icon name="person-circle" class="icon"></ion-icon>
                ${people[i].name}
                <ion-icon name="checkmark" class="checkmark"></ion-icon>
            </li>`
        }
    })
}

function getMessages(){
    let messages = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages')
    messages.then(data => {
        let messages = data.data
        let chat = document.querySelector('.chat')
        for(let i=0; i < messages.length; i++){
            if(messages[i].type === "status"){
                chat.innerHTML += 
                `<div class="individual-text status">
                    <span>(${messages[i].time})</span>
                    <span class="bold">${messages[i].from}</span>
                    ${messages[i].text}
                </div>`
            } if(messages[i].type === 'message'){
                chat.innerHTML += 
                `<div class="individual-text message">
                    <span>(${messages[i].time})</span>
                    <span class="bold">${messages[i].from}</span>
                     para <span class="bold">${messages[i].to}</span>
                     ${messages[i].text}
                </div>`
            } if(messages[i].type === 'private_message'){
                chat.innerHTML += 
                `<div class="individual-text private_message">
                    <span>(${messages[i].time})</span>
                    <span class="bold">${messages[i].from}</span>
                     reservadamente para <span class="bold">${messages[i].to}</span>
                    ${messages[i].text}
                </div>`
            }
        }
        scrollToEnd()
    })
    .catch(err => console.log(err))
}

function scrollToEnd(){
    document.querySelector('.chat .individual-text:nth-last-child(1)').scrollIntoView();
}

function showModal(){
    document.querySelector(".modal").classList.toggle("hidden")
    document.querySelector(".modal-container").classList.toggle("hidden")
}