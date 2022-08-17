//40-35-25
//const tf = require('@tensorflow/tfjs');
const tf = require("@tensorflow/tfjs-node");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require("fs");
const path = require('path');
const dataURL = "training_data.json";  
const data_to_predict_URL = "information.json";
let _inputs = new Array();

async function getData(){
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

    return dati_utili;
}

async function getData_fromJson(){
    let dati_utili = new Array();

    const json_data = fs.readFileSync(data_to_predict_URL, {encoding: 'utf8', flag: 'r'});

    let obj = JSON.parse(json_data); //now it an object
    console.log("obj letto dal file", obj);
    console.log("lunghezza dato", Object.keys(obj).length);
    console.log("obj[0]", obj[0]);
    console.log("obj[0].winrate_infos", obj[0].winrate_infos);
    console.log("obj[1]", obj[1]);
    console.log("obj[1].champion_stats.winrate", obj[1].champion_stats.winrate);
    console.log("obj[2]", obj[2]);
    console.log("obj[2].difference_between_teams", obj[2].difference_between_teams);

    //console.log("global_winrate", obj[i].winrate_infos.winrate_player, "winrate_champion", obj[i+1].champion_stats.winrate, "dbt", obj[i+2].difference_between_teams, "result", obj[i+3].result);

    let data_to_push = {"global_winrate": obj[0].winrate_infos.winrate_player, "winrate_champion": obj[1].champion_stats.winrate, "dbt": obj[2].difference_between_teams};
    console.log("data to push" ,data_to_push);
    dati_utili.push(data_to_push);

    console.log("dati utili", dati_utili);
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
    console.log("dentro predict model");
    //console.log("model = ", model);

    const [x, y] = tf.tidy(() => { //da fixare
        //console.log("before linspace");
        const nx = tf.linspace(0,1,100); //crea un vettore uni dim da 100
        //console.log("prima di predict, nx = ", nx);

        let tens_reshap = nx.reshape([100, 1]);
        //console.log("tens_reshap", tens_reshap);
        const ny = model.predict(tens_reshap); //modifica forma del tensore e genera predizione su esso (perché la fa?)
        //console.log("ny =", ny);

        const x = nx.mul(iMax.sub(iMin)).add(iMin);
        //console.log("x = ", x);
        const y = ny.mul(oMax.sub(oMin)).add(oMin);
        //console.log("y = ", y);

        //console.log("x.dataSync(), y.dataSync()", x.dataSync(), y.dataSync());
        return [x.dataSync(), y.dataSync()]; //scarica valori dal tf.Tensor
    })

    //console.log("dopo tidy");

    const predictedValues = Array.from(x).map((val, i)=>{
        //console.log("(val, i)",val, i);
        return {x: val, y: y[i]};
    })

    console.log("dopo ultima funzione");

    return predictedValues;

}

async function run(){
    console.log("prima di getdata");
    const data = await getData(); //i dati estrapolati dal JSON
    //console.log("dopo getdata prima di for");
    
    for(let i = 0; i < data.length; i++){
        if(data[i].result == "win"){
            data[i].result = 1;
        }else{
            data[i].result = 0;
        }

        _inputs[i] = ((data[i].global_winrate * 35) + (data[i].winrate_champion * 40) + (data[i].dbt * 25)) / 100;
    }

    //console.log("prima di createmodel");
    const model = createModel();

    //console.log("prima di data to tensor");
    const dataset = dataToTensor(data);

    //console.log("prima di dataset");
    const { inputs, outputs } = dataset;
    //console.log("prima di trainelmodel");
    //console.log("Inputs trainmodel", inputs);
    //console.log("dataset", dataset);
    await trainModel(model, inputs, outputs);
    //console.log("prima di save");
    await model.save('file://\models');

    console.log("Done");
    //await predictModel(model,data_xy, dataset);//PREDICT
}

async function loadModel(){
    console.log("loadmodel dentro");
    let model_br;
    try{
        //let path_model = path.resolve('model.json');
        //console.log("path_model", path_model);
        model_br = await tf.loadLayersModel('file://models/model.json'); //prova a dare file
    }
    catch(e){
        console.log("errore nel loadmodel", e);
    }
    
    console.log("summary del model");
    model_br.summary();
    return model_br;
}

async function predict(){
    console.log("esecuzione di predict");
    const data_to_pred = await getData_fromJson();
    //console.log("dopo get data", data_to_pred);
    for(let i = 0; i < data_to_pred.length; i++){
        if(data_to_pred[i].result == "win"){
            data_to_pred[i].result = 1;
        }else{
            data_to_pred[i].result = 0;
        }

        _inputs[i] = ((data_to_pred[i].global_winrate * 35) + (data_to_pred[i].winrate_champion * 40) + (data_to_pred[i].dbt * 25)) / 100;
    }

    //console.log("dati mappati", data_to_pred);

    let data_xy = data_to_pred.map(d => {
        return {x: d, y: d.result};
    });
    
    //console.log("dopo data_xy");
    
    for(let i = 0; i < data_xy.length; i++){
        console.log("data_xy[i].x", data_xy[i].x);
        data_xy[i].x = _inputs[i];
        console.log("data_xy[i].x", data_xy[i].x);
    }
    
    //console.log("dopo manipolazione data_xy");
    //console.log(data_xy)
    //console.log("prima di data to tensor");

    const data_to_tensor = dataToTensor(data_to_pred);

    //console.log("dopo data to tensor e prima di predict model");
    let modelToLoad = await loadModel();
    //console.log("dentro loadmodel", modelToLoad);

    const prediction = await predictModel(modelToLoad, data_to_pred, data_to_tensor);
    //console.log("predizione eseguita: ");
    //console.log("predizione", prediction[0].x);
    //prediction.print();
    console.log("fine predizone");
    return prediction[0].x;
}


module.exports.predict = predict;