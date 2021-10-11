const express = require('express')
const axios = require('axios')
let Web3 = require('web3')
var web3 = new Web3(Web3.givenProvider || "ws://localhost:3030")
const config = require('../config.json')

const router = express.Router()

let weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]

router.get('/', async (req, res) => {
    const {accountAddress, eventType, collectionSlug} = req.query;
    filters = {
        offset: 0,
        limit: '20',
    }
    error = ''
    
    if(accountAddress) filters['account_address'] = accountAddress;
    if(eventType) {
        if(eventType !== 'all'){
            filters['event_type'] = eventType;
        }
    }
    if(collectionSlug) filters['collection_slug'] = collectionSlug

    let eventTableData = []
    try{
        let response = null;
        do{
            response = await axios.get('https://api.opensea.io/api/v1/events', {params: filters})
            response.data.asset_events.forEach(event => {
                let owner = ''
                if(event.asset && event.asset.owner){
                    owner = event.asset.owner.address
                }
                eventTableData.push({
                    createdDate: event.created_date,
                    owner: owner,
                    bid_amount: event.bid_amount ? web3.utils.fromWei(`${event.bid_amount}`) : 0,
                    collectionName: event.collection_slug ? event.collection_slug : '',
                    tokenId: event.asset ? event.asset.token_id : ''
                })
            });
            filters.offset += parseInt(filters.limit);
        }while(response.data && config.recordsToFetch > filters.offset);
        console.log(response.data)
    }catch(err){
        console.log("Something went wrong", err)
        error = err.message
    }
    

    res.render('home/index.ejs', {
        title: 'OpenSea Events',
        filters: filters,
        data: eventTableData,
        error: error
    })
})

module.exports = router