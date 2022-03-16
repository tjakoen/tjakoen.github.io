$(document).ready(function() {
	$('#booking_selector').on('change',function(){
		$('#calendar').fullCalendar('rerenderEvents');
	})

	$('#calendar').fullCalendar({
		dayMaxEventRows: true, // for all non-TimeGrid views
		views: {
		timeGrid: {
			dayMaxEventRows: 6 // adjust to 6 only for timeGridWeek/timeGridDay
		}
		},
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month',
		},
		displayEventTime: false,
		events: function(start, end, timezone, callback ) {
			fetchMetaData().then(function(data) {
				var eventsList = [];
				for (var i = 0; i < data.length; i++) {
					var item =  data[i];
					var name = item.name + (item.cf_24 ? ' - ' + item.cf_24 : '');
					
					// if ( new Date(item.cf_8) < new Date()) continue;
					if ( item.closing_status_id != 0 ) continue;

					var checkInDate = new Date(item.cf_8).toLocaleString("en-US");
					var checkOutDate = new Date(item.cf_9).toLocaleString("en-US");
					
					var stage;
					switch ( item.pipeline_stage_id ) {
						case 3: stage = 'yellow';
						break;
					case 4: stage = 'yellow';
						break;
					case 7: stage = 'yellow';
						break;
					case 8: stage = 'yellow';
						break
					case 5: stage = 'red';
						break;
						case 6: stage = 'lightgreen';
						break;
					}

					let accom = ""
					if (item.cf_29) {
						accom = item.cf_29;	
						accom = accom.replace("39", "R1");
						accom = accom.replace("40", "R2");
						accom = accom.replace("41", "R3");
						accom = accom.replace("42", "R4");
						accom = accom.replace("43", "R5");
						accom = accom.replace("44", "G1");
						accom = accom.replace("45", "G2");
						accom = accom.replace("46", "G3");
						accom = accom.replace("47", "G4");
						accom = accom.replace("48", "G5");
						accom = accom.replace("49", "G6");
						accom = accom.replace("50", "VILLA");
						accom = accom.replace("51", "DAY TRIP");
						accom = accom.replace("52", "CAMPERS");
						accom = accom.replace("53", "EXCLUSIVE");
					}
		
					
				
					var event = {
						title: (accom != "" ?  accom + " - ": "") + name,
						start: checkInDate,
						end: checkOutDate,
						color: stage,
						textColor: 'black',
						url: 'https://budgetoutings.flowlu.com/_module/crm/view/lead/' + item.id,
					};
					eventsList.push(event);
				}
				callback(eventsList);
			});
		},
		eventRender: function eventRender( event, element, view ) {
			console.log (event);
			return ['all', event.color].indexOf($('#booking_selector').val()) >= 0
		},
		eventClick: function(info) {
			//info.jsEvent.preventDefault(); // don't let the browser navigate
			if (info.event.url) {
				window.open(info.event.url);
			}
		},
	});
});

async function fetchMetaData() {
	let allData = [];
	let morePagesAvailable = true;
	let currentPage = 0;
	let totalPages = 0;

	while(morePagesAvailable) {
	currentPage++;
	const response = await fetch(`https://budgetoutings.flowlu.com/api/v1/module/crm/lead/list?api_key=aGU5NVJWYW00UTNsZmkyanpSNkVzTDd5Z2dnTUdvcWxfNzY5ODY&filter[pipeline_stage_id]=3,4,5,6,7,8&limit=100&page=${currentPage}`)
	let data = await response.json();
	totalPages = totalPages == 0 ? Math.ceil( (data.response.total_result) / 100 ) : totalPages;
	let items = data.response.items;
		items.forEach(e => allData.unshift(e));
	morePagesAvailable = currentPage < totalPages;
	}
	//console.log ( allData );
	return allData;
}