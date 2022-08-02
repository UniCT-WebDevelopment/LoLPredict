
const carsURL = "https://storage.googleapis.com/tfjs-tutorials/carsData.json";  

async function getData(){
    const cardDataReq = await fetch(carsURL);
    const carsData = await cardDataReq.json();

    const data = carsData.map(car => {
        return {
            mpg: car.Miles_per_Gallon,
            weight: car.Weight_in_lbs,
            horsepower: car.Horsepower
        }
    })
    return data;
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
        const inputs = data.map(d => d.horsepower);
        const outputs = data.map(d => d.mpg);
        //trasformare in tensore

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
    model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.meanSquaredError, //quanto un modello si comporta male sui dati
        metrics: ['mse']
    });

    const batchSize = 10; //sotto gruppo di dati da addestrare
    const epochs = 120; //epochs numero di iterazioni

    return await model.fit(inputs, targets, { //fa training del modello con certi input, target e parametri
        batchSize,
        epochs,
        shuffle : true,
        callbacks: tfvis.show.fitCallbacks(
            {name : "Trinint Performance"},
            ["loss", "mse"], //cosa deve mostrare
            {height: 200, callbacks: ['onEpochEnd']}
        )
            
    })
}

async function testModel(model,data_xy, {inputs, iMin, iMax, oMin, oMax}){

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

    tfvis.render.scatterplot(
        {name : "Predicted vs Original"},
        {values: [data_xy, predictedValues], series: ["original", "predicted"]},
        {
            xLabel:"Miles_per_Gallon",
            yLabel:"Weight_in_lbs",
            height: 300
        }
    )
}

async function run(){
    const cont = document.getElementById("plot_container");

    const data = await getData(); //i dati estrapolati dal JSON {mpg, weight}
    const data_xy = data.map(d => {
        return {x: d.horsepower, y: d.mpg};
    });
    console.log(data_xy)
    tfvis.render.scatterplot(
        {name: "Consumo vs Peso"},
        {values: data_xy},
        {
            xLabel:"x", //Miles_per_Gallon?
            yLabel:"y", //Weight_in_lbs?
            height: 300
        }
    );

    const model = createModel();
    tfvis.show.modelSummary({name:"model info"}, model);

    const dataset = dataToTensor(data);

    const { inputs, outputs } = dataset;
    await trainModel(model, inputs, outputs);
    console.log("Done");

    await testModel(model,data_xy, dataset);
}

document.addEventListener("DOMContentLoaded", run());