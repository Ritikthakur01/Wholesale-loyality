import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();
// console.log("Cpu Count ::>>",os.cpus().length);
if(cluster.isPrimary){
    console.log(`|--- Master Here ${process.pid} ---|`);
    const CPUCount = os.cpus().length;
    for(let i=0;i<CPUCount;i++){
        cluster.fork();
    }
    cluster.on('exit',(worker, code, signal)=>{
        console.log(`|--- Worker ${process.pid} has been killed ---|`);
        console.log(`|--- New Worker Starting ---|`);
        cluster.fork();
    })
}
else{
    require('./app');
    console.log(`|--- Worker Here ${process.pid} ---|`);
}

