//40-35-25
const tf = require('@tensorflow/tfjs');
require("@tensorflow/tfjs-node");
//const tfvis = require("@tensorflow/tfjs-vis");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require("fs");
const dataURL = "training_data.json";  
const data_to_predict_URL = "information.json";
let _inputs = new Array();
var modelToLoad;

async function getData(){
    /*
    const cardDataReq = await fetch(dataURL);
    const carsData = await cardDataReq.json();

    const data = carsData.map(car => {
        return {
            mpg: car.Miles_per_Gallon,
            weight: car.Weight_in_lbs,
            horsepower: car.Horsepower
        }
    })
    return data;*/
    let dati_utili = new Array();

    const json_data = fs.readFileSync(dataURL, {encoding: 'utf8', flag: 'r'});

    let obj = JSON.parse(json_data); //now it an object
    //console.log("Object.keys(obj).length", Object.keys(obj).length);
    for(let i = 0; i < Object.keys(obj).length; i+=4){
        //console.log("global_winrate", data[i].winrate_infos.winrate_player, "winrate_champion", data[i+1].champion_stats.winrate, "dbt", data[i+2].difference_between_teams, "result", data[i+3].result)
        let data_to_push = {"global_winrate": obj[i].winrate_infos.winrate_player, "winrate_champion": obj[i+1].champion_stats.winrate, "dbt": obj[i+2].difference_between_teams, "result": obj[i+3].result};
        console.log(data_to_push);
        dati_utili.push(data_to_push);
    }
    /*
    await fetch(dataURL)
    .then(resp => resp.json())
    .then(data =>{
        //console.log("Object.keys(data).length", Object.keys(data).length);
        console.log("dati di fetchurl per tensorflow", data);
        for(let i = 0; i < Object.keys(data).length; i+=4){
            //console.log("global_winrate", data[i].winrate_infos.winrate_player, "winrate_champion", data[i+1].champion_stats.winrate, "dbt", data[i+2].difference_between_teams, "result", data[i+3].result)
            let data_to_push = {"global_winrate": data[i].winrate_infos.winrate_player, "winrate_champion": data[i+1].champion_stats.winrate, "dbt": data[i+2].difference_between_teams, "result": data[i+3].result};
            dati_utili.push(data_to_push);
        }
        //console.log("fine preso array");
        //console.log(dati_utili);
    })
    .catch(error => {
        console.log("andato in catch la richiesta", error);
    })
    */
    return dati_utili;
}

async function getData_fromJson(){
    /*
    const cardDataReq = await fetch(dataURL);
    const carsData = await cardDataReq.json();

    const data = carsData.map(car => {
        return {
            mpg: car.Miles_per_Gallon,
            weight: car.Weight_in_lbs,
            horsepower: car.Horsepower
        }
    })
    return data;*/
    let dati_utili = new Array();

    const json_data = fs.readFileSync(data_to_predict_URL, {encoding: 'utf8', flag: 'r'});

    let obj = JSON.parse(json_data); //now it an object
    //console.log("Object.keys(obj).length", Object.keys(obj).length);
    for(let i = 0; i < Object.keys(obj).length; i+=4){
        //console.log("global_winrate", data[i].winrate_infos.winrate_player, "winrate_champion", data[i+1].champion_stats.winrate, "dbt", data[i+2].difference_between_teams, "result", data[i+3].result)
        let data_to_push = {"global_winrate": obj[i].winrate_infos.winrate_player, "winrate_champion": obj[i+1].champion_stats.winrate, "dbt": obj[i+2].difference_between_teams, "result": obj[i+3].result};
        console.log(data_to_push);
        dati_utili.push(data_to_push);
    }
    /*
    await fetch(dataURL)
    .then(resp => resp.json())
    .then(data =>{
        //console.log("Object.keys(data).length", Object.keys(data).length);
        console.log("dati di fetchurl per tensorflow", data);
        for(let i = 0; i < Object.keys(data).length; i+=4){
            //console.log("global_winrate", data[i].winrate_infos.winrate_player, "winrate_champion", data[i+1].champion_stats.winrate, "dbt", data[i+2].difference_between_teams, "result", data[i+3].result)
            let data_to_push = {"global_winrate": data[i].winrate_infos.winrate_player, "winrate_champion": data[i+1].champion_stats.winrate, "dbt": data[i+2].difference_between_teams, "result": data[i+3].result};
            dati_utili.push(data_to_push);
        }
        //console.log("fine preso array");
        //console.log(dati_utili);
    })
    .catch(error => {
        console.log("andato in catch la richiesta", error);
    })
    */
    return dati_utili;
}

function createModel(){
    const model = tf.sequential(); //un modello a strati dove uno strato alimenta l'altro
    model.add(tf.layers.dense({inputShape:[1], units:50, activation: "relu"}));//indica layer nascosto cioè quello che prende dati e input per lavorare
    model.add(tf.layers.dense({units: 50, activation: "sigmoid"})); //livello con 50 sigmoidi per fare curva
    model.add(tf.layers.dense({units:1, activation: "sigmoid"}));//strato di output
    //inputshape prende gli input
    //importante livello di attivazione -> activation è funzione che viene usata sui nodi dei dati
    //neurone prende input e li somma con pesi relativi e poi applica funzione applicazione (in activation)
    return model;
}

function dataToTensor(data){
    return tf.tidy(()=>{
        tf.util.shuffle(data); //mescola array?

        
        const inputs = _inputs.map(d => d);
        //trasformare in tensore
        const outputs = data.map(e => e.result);

        //console.log(outputs);
        

        const inputsT = tf.tensor2d(inputs, [inputs.length, 1]);
        const outputsT = tf.tensor2d(outputs, [outputs.length, 1]);

        //normalizzare i dati
        const iMin = inputsT.min();
        const iMax = inputsT.max();

        const oMin = outputsT.min();
        const oMax = outputsT.max();

        //normalizzazione del vettore
        //value da normalizzare
        //setti min e max
        //Normalized_value = (value - min)/max - min
        const nInputsT = inputsT.sub(iMin).div(iMax.sub(iMin));
        const nOutputsT = outputsT.sub(oMin).div(oMax.sub(oMin));

        return {
            inputs: nInputsT,
            outputs: nOutputsT,
            iMin, iMax, oMin, oMax
        }
    });
    
}

async function trainModel(model, inputs, targets){
    console.log("prima di compile");
    model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.meanSquaredError, //quanto un modello si comporta male sui dati
        metrics: ['mse']
    });

    
    const batchSize = 10; //sotto gruppo di dati da addestrare
    const epochs = 120; //epochs numero di iterazioni
    console.log("prima di fit");

    return await model.fit(inputs, targets, { //fa training del modello con certi input, target e parametri
        batchSize,
        epochs,
        shuffle : true,
        callbacks: tf.callbacks.earlyStopping({ 
            monitor: "targets" }),
    })

    
}

async function predictModel(model,data_xy, {inputs, iMin, iMax, oMin, oMax}){

    const [x, y] = tf.tidy(() => {
        const nx = tf.linspace(0,1,100); //crea un vettore uni dim da 100
        const ny = model.predict(nx.reshape([100, 1])); //modifica forma del tensore e genera predizione su esso (perché la fa?)

        const x = nx.mul(iMax.sub(iMin)).add(iMin);
        const y = ny.mul(oMax.sub(oMin)).add(oMin);

        return [x.dataSync(), y.dataSync()]; //scarica valori dal tf.Tensor
    })

    const predictedValues = Array.from(x).map((val, i)=>{
        return {x: val, y: y[i]};
    })

    /*
    tfvis.render.scatterplot(
        {name : "Predicted vs Original"},
        {values: [data_xy, predictedValues], series: ["original", "predicted"]},
        {
            xLabel:"dbt",
            yLabel:"Result",
            height: 300
        }
    )
    */
}

async function run(){
    console.log("prima di getdata");
    const data = await getData(); //i dati estrapolati dal JSON {mpg, weight}
    console.log("dopo getdata prima di for");
    
    for(let i = 0; i < data.length; i++){
        if(data[i].result == "win"){
            data[i].result = 1;
        }else{
            data[i].result = 0;
        }

        _inputs[i] = ((data[i].global_winrate * 35) + (data[i].winrate_champion * 40) + (data[i].dbt * 25)) / 100;
    }

    //console.log("dati mappati", data);
    /*
    let data_xy = data.map(d => {
        return {x: d, y: d.result};
    });

    for(let i = 0; i < data_xy.length; i++){
        console.log("data_xy[i].x", data_xy[i].x);
        data_xy[i].x = _inputs[i];
        console.log("data_xy[i].x", data_xy[i].x);
    }

    console.log(data_xy)
    */
    /*
    tfvis.render.scatterplot(
        {name: "Winrate personale vs Result"},
        {values: data_xy},
        {
            xLabel:"x", //Miles_per_Gallon?
            yLabel:"y", //Weight_in_lbs?
            height: 300
        }
    );
    */

    console.log("prima di createmodel");
    const model = createModel();
    //tfvis.show.modelSummary({name:"model info"}, model);

    console.log("prima di data to tensor");
    const dataset = dataToTensor(data);

    console.log("prima di dataset");
    const { inputs, outputs } = dataset;
    console.log("prima di trainelmodel");
    console.log("Inputs trainmodel", inputs);
    console.log("dataset", dataset);
    await trainModel(model, inputs, outputs);
    console.log("prima di save");
    await model.save('file://\models');

    console.log("Done");
    //await predictModel(model,data_xy, dataset);//PREDICT
}

async function loadModel(){
    modelToLoad = await tf.loadLayersModel('../models/model.json');
}

async function predict(){
    const data_to_pred = await getData_fromJson();

    for(let i = 0; i < data_to_pred.length; i++){
        if(data_to_pred[i].result == "win"){
            data_to_pred[i].result = 1;
        }else{
            data_to_pred[i].result = 0;
        }

        _inputs[i] = ((data_to_pred[i].global_winrate * 35) + (data_to_pred[i].winrate_champion * 40) + (data_to_pred[i].dbt * 25)) / 100;
    }

    console.log("dati mappati", data_to_pred);

    let data_xy = data_to_pred.map(d => {
        return {x: d, y: d.result};
    });
    console.log("DOPO DATA_XY");
    for(let i = 0; i < data_xy.length; i++){
        console.log("data_xy[i].x", data_xy[i].x);
        data_xy[i].x = _inputs[i];
        console.log("data_xy[i].x", data_xy[i].x);
    }
    console.log("DOPO MANIPOLAZIONE DATA_XY");

    console.log(data_xy)

    const data_to_tensor = dataToTensor(data_to_pred);
    const prediction = await predictModel(modelToLoad, data_to_pred, data_to_tensor);
    console.log("predizione eseguita: ");
    prediction.print();
}


module.exports.loadModel = loadModel;
module.exports.predict = predict;
module.exports.run = run;