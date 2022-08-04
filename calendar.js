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
				let date = getDate();
				for (var i = 0; i < data.length; i++) {
					var item =  data[i];				
					
					// Do not display if checkout date is not today
					if ( item.cf_9 ) { // Day Trip has no checkout date set sometimes
						if ( new Date(item.cf_9) < date ) continue; // If checkout is before today remove
					} else if ( new Date( item.cf_8 ) < date ) continue; // If check-in is before yesterday remove (For Day Trip)

					// Do not display closed leads
					if ( item.closing_status_id == 1 || item.closing_status_id == 2|| item.closing_status_id == 3|| item.closing_status_id == 4|| item.closing_status_id == 5 || item.closing_status_id == 6 || item.closing_status_id == 7 || item.closing_status_id == 8) {
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

					// Accommodations (Multi-Select)
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


					// Inclusions (Multi-Select)
					let bookInclusions = "";
					if (item.cf_32) {
						bookInclusions = item.cf_32;	
						bookInclusions = bookInclusions.replace("63", "Promo Booking");
						bookInclusions = bookInclusions.replace("64", "Pilows & Beddings");
						bookInclusions = bookInclusions.replace("65", "Catering");
						bookInclusions = bookInclusions.replace("66", "Transportation");
						bookInclusions = bookInclusions.replace("67", "Team Building");
						bookInclusions = bookInclusions.replace("68", "Island Hopping (Shuttle)");
						bookInclusions = bookInclusions.replace("69", "Island Hopping (Private)");
						bookInclusions = bookInclusions.replace("70", "Hiking");
						bookInclusions = bookInclusions.replace("71", "KTV Rental");
					}

					// SETUP STRING
					var bookingName = item.name + (item.cf_24 ? ' - ' + item.cf_24 : '');
					var groupType =  ( item.cf_15 != "" ? "\n👪 " + getGroupType(item.cf_15) : ""); 
					var numberOfPax = ( item.cf_11 != "" ? " (" + item.cf_11 + " PAX)" : ""); 
					var accommodationType = (accom != "" ?  "\n🏠 [ " + accom + " ]": "");
					var bookingType = ( item.cf_14 != null  ?  getBookingType(item.cf_14) : "");
					var bookingInclusions =  ( item.cf_32 != null  ?  "\n🔎 " + bookInclusions : ""); 
					var bookingNotes = ( item.cf_30 != null  ? "\n📃 " +  item.cf_30 : "");

					var event = {
						title:  bookingName + groupType + numberOfPax + accommodationType + ": " + bookingType + bookingInclusions + bookingNotes,
						start: checkInDate,
						end: checkOutDate,
						color: stage,
						textColor: 'black',
						url: 'https://sales.budgetoutings.com.ph/_module/crm/view/lead/' + item.id,
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
		eventClick: function(event) {
			if (event.url) {
				window.open(event.url, "_blank");
				return false;
			}
		},
	});
});
	
// BOOKING TYPE
function getBookingType (values) {
	var type = {
	  '58': '1799 All-in Team Building w/ Transpo',
	  '7': 'Overnight Camping',
	  '5': 'Dormitory Accommodations',
	  '6': 'Day Trip',
	  '9': 'Team Building',
	  '56': '799 Team Building Promo',
	  '57':'Catering',
	};
	return type[values];
}

function getGroupType (values) {
	var type = {
	  '12': 'Company Outing',
	  '11': 'Team Outing',
	  '13': 'Family Outing',
	  '14': 'Barkada Outing',
	  '15': 'Church Group',
	  '16': 'Government',
	  '22': 'Couple Outing',
	  '59': 'School/University',
	};
	return type[values];
}



function getDate() {
	var today = new Date();
	var yesteday = new Date();
	// var dayBeforeYesterday = new Date();
	yesteday.setDate(today.getDate() - 1);
	// dayBeforeYesterday.setDate(yesteday.getDate() - 1);
	return yesteday;
}
// Get All CRM Leads (Can be optimitzed)
async function fetchMetaData() {
	let allData = [];
	let morePagesAvailable = true;
	let currentPage = 0;
	let totalPages = 0;

	var date = getDate();
	var dateString = date.getFullYear() + "-0" + (date.getMonth()+1) + "-" + date.getDate();

	while(morePagesAvailable) {
		currentPage++; // Start with page 1
		// const response = await fetch(`https://budgetoutings.flowlu.com/api/v1/module/crm/lead/list?api_key=aGU5NVJWYW00UTNsZmkyanpSNkVzTDd5Z2dnTUdvcWxfNzY5ODY&filter[pipeline_stage_id]=3,4,5,6,7,8&limit=100&page=${currentPage}`)
		const requestString = `https://budgetoutings.flowlu.com/api/v1/module/crm/lead/list?api_key=aGU5NVJWYW00UTNsZmkyanpSNkVzTDd5Z2dnTUdvcWxfNzY5ODY&filter[pipeline_stage_id]=3,4,5,6,7,8&filter[cf.field_8]={"start_date":"${dateString}"}&limit=100&page=${currentPage}`;
		console.log ( requestString );
		const response = await fetch(requestString);
		let data = await response.json();
		// Round up to nearest page if on first loop
		totalPages = totalPages == 0 ? Math.ceil( (data.response.total_result) / 100 ) : totalPages;
		let items = data.response.items;
		items.forEach(e => allData.unshift(e));
		morePagesAvailable = currentPage < totalPages;
	}
	return allData;
}