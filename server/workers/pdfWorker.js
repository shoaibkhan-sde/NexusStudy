const { Worker, Queue } = require('bullmq');
const { redisClient } = require('../config/redis');

// Define the Queue
const pdfQueue = new Queue('pdf-processing', { connection: redisClient });

// Define the Worker
const pdfWorker = new Worker('pdf-processing', async job => {
    console.log(`[Worker] Started processing PDF job: ${job.id}`);
    console.log(`[Worker] Data received:`, job.data);
    
    // Simulate heavy AI processing / Vector Embeddings extraction
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`[Worker] Finished processing PDF job: ${job.id}`);
    
    // Future: 
    // 1. Extract text from PDF
    // 2. Send to OpenAI for summary
    // 3. Update Resource Document in MongoDB with summary
}, { connection: redisClient });

pdfWorker.on('completed', job => {
    console.log(`[Worker] Job ${job.id} has completed!`);
});

pdfWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} has failed with error: ${err.message}`);
});

module.exports = { pdfQueue, pdfWorker };
