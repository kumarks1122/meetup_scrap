var mysql = require('mysql');
var request=require("request");
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'evently_development'
});
connection.connect(function(err){
	if(err){
		console.log('Error connecting to Db');
		return;
	}
});

request.get("https://api.meetup.com/activity?format=json&photo-host=public&key=516927271221e607c3112756985874&page=1000",function (supplierError, supplierResponse, supplierBody) {
	if (!supplierError) {
		feedData = JSON.parse(supplierBody)
		console.log(feedData)
		if (feedData.results!=undefined) {
			feedData.results.forEach(function(feed,index) {
				getData(feed.member_id)
			})
		}
	}
})

var insertedData = 0

function getData(member_id){
	request.get("https://api.meetup.com/2/events?format=json&photo-host=public&key=516927271221e607c3112756985874&page=1000000&order=time&offset=0&format=json&limited_events=False&&member_id="+member_id,function (eventError, eventResponse, eventBody) {
		if (!eventError) {
			events = JSON.parse(eventBody)
			console.log(eventBody)
			eventsArray = []
			if (events.results!=undefined) {
				events.results.forEach(function(event,index) {
					eventArray = [
						event.utc_offset,
						event.headcount,
						JSON.stringify(event.venue),
						event.venue_name,
						event.venue_city,
						event.visibility,
						event.waitlist_count,
						event.created,
						event.maybe_rsvp_count,
						event.description,
						event.event_url,
						event.yes_rsvp_count,
						event.duration,
						event.name,
						event.updated,
						JSON.stringify(event.group),
						event.status
					]
					eventsArray.push(eventArray)
					insertedData+=1;
				})
				var sql = "INSERT IGNORE INTO meetup_data (utc_offset, headcount, venue_dump, venue_name, venue_city, visibility, waitlist_count,created,maybe_rsvp_count,description,event_url,yes_rsvp_count,duration,name,updated,group,status) VALUES ?";
				connection.query(sql, [eventsArray], function(err) {
					if (err) throw err;
					console.log("Datas Inserted : "+insertedData+" Events")
				});
			}
		}
})
}

