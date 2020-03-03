var fetch= require('node-fetch');
var redis = require("redis"),
    client = redis.createClient();

const {promisify} = require('util');
//const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const baseURL = 'https://jobs.github.com/positions.json'

async function fetchGithub() {

    let resultCount = 1
    let onPage= 0; 
    let allJobs = [];
    
    //fetch all pages
    while(resultCount > 0) {
    const res = await fetch(`${baseURL}?page=${onPage}`);
    const jobs = await res.json();
    allJobs.push(...jobs);
    resultCount = jobs.length;
    console.log('got '+ resultCount + ' jobs'+ ' current page ' +onPage);
    onPage++;
    }

    //filter algo
    const jrJobs= allJobs.filter(job =>{
        const jobTitle = job.title.toLowerCase();

        if (
        jobTitle.includes('senior') || 
        jobTitle.includes('manager') || 
        jobTitle.includes('sr.') || 
        jobTitle.includes('architect')
        ) {
            return false;
        }

        return true;
    })

    console.log('Filtered down to ' + jrJobs.length);

    // set in redis
    console.log('got ' + allJobs.length + ' jobs')
    const success = await setAsync('github', JSON.stringify(jrJobs));

    console.log({success});
}


module.exports = fetchGithub;