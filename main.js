
const carsURL = "https://storage.googleapis.com/tfjs-tutorials/carsData.json";  

async function getData(){
    const cardDataReq = await fetch(carsURL);
    const carsData = await cardDataReq.json();

    const data = carsData.map(car => {
        return {
            mpg: car.Miles_per_Gallon,
            weight: car.Weight_in_lbs
        }
    })
    return data;
}

function createModel(){
    const model = tf.sequential();
    model.add(tf.layers.dense({inputShape:[1], units:1, useBias: true}));

    model.add(tf.layers.dense({units:1, useBias: true}));

    return model;
}

function dataToTensor(data){
    return tf.tidy(()=>{
        tf.util.shuffle(data);
        const inputs = data.map(d => d.mpg);
        const outputs = data.map(d => d.weight);
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

    const batchSize = 30; //sotto gruppo di dati da addestrare
    const epochs = 50; //epochs numero di iterazioni

    return await model.fit(inputs, targets, {
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
        const ny = model.predict(nx.reshape([100, 1]));

        const x = nx.mul(iMax.sub(iMin)).add(iMin);
        const y = ny.mul(oMax.sub(oMin)).add(oMin);

        return [x.dataSync(), y.dataSync()];
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
        return {x: d.mpg, y: d.weight};
    });
    console.log(data_xy)
    tfvis.render.scatterplot(
        {name: "Consumo vs Peso"},
        {values: data_xy},
        {
            xLabel:"Miles_per_Gallon",
            yLabel:"Weight_in_lbs",
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