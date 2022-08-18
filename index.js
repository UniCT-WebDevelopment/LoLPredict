let obbj;

//qui possiamo prendere i dati da passare 
fetch("../models/model.json")
.then(resp => resp.json())
.then(data => obbj = JSON.stringify(data))
.catch(err => obbj = err)