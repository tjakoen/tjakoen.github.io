$(document).ready(function() {
	$('#booking_selector').on('change',function(){
		$('#calendar').fullCalendar('rerenderEvents');
	})

	$('#calendar').fullCalendar({
		height: 'parent',
		defaultView: 'listYear', // Default to Year so that the calendar doesnt have to load when going through months and weeks
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,listYear,listMonth,listWeek',
		},
		buttonText: {
			month: 'Calendar',
			listYear: 'Year',
			listMonth: 'Month',
			listWeek: 'Week',
	   	},
	   	// Only show 6 dates on calendar, show 'show more' if more than 6 
		eventLimit: true,
		views: {
			month: {
			eventLimit: 6
			}
		},
		displayEventTime: false,
		events: function(start, end, timezone, callback ) {
			fetchMetaData().then(function(data) {
				var eventsList = [];
				for (var i = 0; i < data.length; i++) {
					var item =  data[i];				
					var today = new Date();
					var yesteday = new Date();
					var dayBeforeYesterday = new Date();
					yesteday.setDate(today.getDate() - 1);
					dayBeforeYesterday.setDate(yesteday.getDate() - 1);

					// Do not display if checkout date is not today
					if ( item.cf_9 ) { // Day Trip has no checkout date set sometimes
						if ( new Date(item.cf_9) < yesteday ) continue; // If checkout is before today remove
					} else if ( new Date( item.cf_8 ) < dayBeforeYesterday ) continue; // If check-in is before yesterday remove (For Day Trip)

					// Do not display closed leads
					if ( item.closing_status_id == 1 || item.closing_status_id == 2|| item.closing_status_id == 3|| item.closing_status_id == 4|| item.closing_status_id == 5) {
						// If a lead was closed, but is in finalization, still display
						// API Limitation, if a lead is closed then opened aagain closing_status_id reains as previous closed.
						if ( item.pipeline_stage_id != 6 ) continue;
					} 

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
						accom = accom.replace("54", "CATERING");
						accom = accom.replace("55", "TEAM BUILDING");
					}
		
					var bookingName = item.name + (item.cf_24 ? ' - ' + item.cf_24 : '');
					var accommodationType = (accom != "" ?  "[ " + accom + " ]": "");
					var numberOfPax = ( item.cf_11 != "" ? "(" + item.cf_11 + " PAX)" : ""); 
					var bookingNotes = ( item.cf_30 != null  ? " \` \` \` \` << " +  item.cf_30 + " >>" : "");

					var event = {
						title:  accommodationType + " : " + bookingName + " " +  numberOfPax + " " + bookingNotes,
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
		// Loading Bar when retreiving data
		loading: function (isLoading) {
			if (isLoading) {
				$('#loading').show();
			}
			else {                
				$('#loading').hide();
			}
		},
		// Filter for color
		eventRender: function eventRender( event, element, view ) {
			return ['all', event.color].indexOf($('#booking_selector').val()) >= 0
		},
		// Open CRM link on click
		eventClick: function(info) {
			//info.jsEvent.preventDefault(); // don't let the browser navigate
			if (info.event.url) {
				window.open(info.event.url);
			}
		},
	});
});

// Get All CRM Leads (Can be optimitzed)
async function fetchMetaData() {
	let allData = [];
	let morePagesAvailable = true;
	let currentPage = 0;
	let totalPages = 0;

	while(morePagesAvailable) {
		currentPage++; // Start with page 1
		const response = await fetch(`https://budgetoutings.flowlu.com/api/v1/module/crm/lead/list?api_key=aGU5NVJWYW00UTNsZmkyanpSNkVzTDd5Z2dnTUdvcWxfNzY5ODY&filter[pipeline_stage_id]=3,4,5,6,7,8&limit=100&page=${currentPage}`)
		let data = await response.json();
		// Round up to nearest page if on first loop
		totalPages = totalPages == 0 ? Math.ceil( (data.response.total_result) / 100 ) : totalPages;
		let items = data.response.items;
		items.forEach(e => allData.unshift(e));
		morePagesAvailable = currentPage < totalPages;
	}
	return allData;
}