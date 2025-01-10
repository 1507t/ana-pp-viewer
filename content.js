const DOMESTIC_ROUTE_RATIO = 2;
const CHART_FILE = 'chart.json';

async function main() {
    const h1 = document.querySelector('h1');
    if(!h1 || !h1.textContent.endsWith('空席照会結果')) return;
    
    const header_departure = document.querySelector('div#main div.availabilityResult .itineraryAirport span.departure > span')?.textContent.trim();
    const header_arrival = document.querySelector('div#main div.availabilityResult .itineraryAirport span.arrival > span')?.textContent.trim();
    if(!header_departure || !header_arrival) return;

    const chart = await fetch_chart();
    
    const fare_main = document.querySelector('div#main div.availabilityResult div#availabilityResultMainFare table');
    const fare_value = document.querySelector('div#main div.availabilityResult div#availabilityResultValueFare table');
    const fare_super_value = document.querySelector('div#main div.availabilityResult div#availabilityResultSuperValueFare table');
    const fare_other = document.querySelector('div#main div.availabilityResult div#availabilityResultOtherFare table');
    const fare_premium = document.querySelector('div#main div.availabilityResult div.availabilityResultPremium table');
    const fare_weekly = document.querySelector('div#main div.availabilityResult div.availabilityResultWeekly table');

    append_result(fare_main, header_departure, header_arrival, chart);
    append_result(fare_value, header_departure, header_arrival, chart);
    append_result(fare_super_value, header_departure, header_arrival, chart);
    append_result(fare_other, header_departure, header_arrival, chart);
    append_result(fare_premium, header_departure, header_arrival, chart);
    append_result(fare_weekly, header_departure, header_arrival, chart);
}

function append_result(fare_table, departure, arrival, chart) {
    if(!fare_table) return;
    const fare_name_element = fare_table.querySelectorAll('thead tr td.availabilityResultFareName a');
    const fare_name_list = Array.from(fare_name_element).map(element => element.textContent);
    const fare_type_list = fare_name_list.map(fare_name => retrieve_fare_type(fare_name));
    const br_element = document.createElement('br');
    const span_element = document.createElement('span');
    span_element.style.whiteSpace = 'nowrap';

    fare_name_element.forEach((name_element, index) => {
        const [fare_number, accrual_rate, boarding_point] = fare_type_list[index];
        if(!fare_number) return;
        const span_element_clone = span_element.cloneNode();
        span_element_clone.innerHTML = `<br><br>運賃${fare_number}<br>${accrual_rate}%<br>+${boarding_point}PP`;
        name_element.append(span_element_clone);
    });

    fare_table.querySelectorAll('tbody tr').forEach(flight_element => {
        let flight_sections = [[departure, arrival]];
        if(flight_element.querySelector('p.availabilityResultFlightRoute') !== null){
            const route_element = Array.from(flight_element.querySelectorAll('p.availabilityResultFlightRoute'));
            flight_sections = route_element.map(element => Array.from(element.children).map(c => c.textContent.trim()).filter(v => v));
        }
        const flight_miles = flight_sections.map(section => get_mile(chart, section[0], section[1]));
        console.log(`flight_miles: ${flight_miles}`);
        if(!flight_miles) return;

        flight_element.querySelectorAll('td div span.selectArea').forEach((fare_cell_element, index) => {
            const price_element = fare_cell_element.querySelector('label > em');
            if(!price_element) return;
            const price = parseInt(price_element.textContent.replace(/[^0-9]/g, ''));
            const hover_info_element = fare_cell_element.parentNode.querySelector('.hoverInfo');
            const fare_type = fare_type_list.length > index ? fare_type_list[index] : retrieve_fare_type(hover_info_element?.textContent.trim().split('/')[1]);
            const accrual_rate = fare_type[1];
            const premium_points = flight_miles.map(flight_mile => calc_premium_point(flight_mile, accrual_rate, DOMESTIC_ROUTE_RATIO, fare_type[2]));
            const premium_point = premium_points.reduce((sum, cur) => sum + cur, 0);
            const premium_point_unit_price = (price / premium_point).toFixed(2);

            if(hover_info_element){
                hover_info_element.textContent += `/${premium_point}PP`;
            }
            
            const span_element_clone = span_element.cloneNode();
            if(premium_point_unit_price < 8) {
                span_element_clone.style.color = 'red';
            }else if(premium_point_unit_price < 9) {
                span_element_clone.style.color = 'hotpink';
            }else if(premium_point_unit_price < 10) {
                span_element_clone.style.color = 'darkorange';
            }
            span_element_clone.textContent = `${premium_point_unit_price}円/PP`;
            
            const price_parent_element = price_element.parentNode;
            price_parent_element.insertBefore(span_element_clone, price_element.nextSibling);
            price_parent_element.insertBefore(br_element.cloneNode(), price_element.nextSibling);

        });
    });
}

async function fetch_chart() {
    return fetch(chrome.runtime.getURL(CHART_FILE))
        .then(response => response.json())
        .catch(error => console.error(error));
}

function get_mile(chart, dep, arr) {
    const [departure, arrival] = [dep, arr].map(str => str.indexOf('(') !== -1 ? str.split('(')[0] : str);
    if(chart[departure] !== undefined && chart[departure][arrival] !== undefined){
        return chart[departure][arrival];
    }else if(chart[arrival] !== undefined && chart[arrival][departure] !== undefined){
        return chart[arrival][departure];
    }else{
        return null;
    }
}

function calc_premium_point(flight_mile, fare_type_ratio, route_ratio, boarding_point){
    return Math.floor(flight_mile * fare_type_ratio * 0.01 * route_ratio) + boarding_point;
}

function retrieve_fare_type(fare_name){
    let fare_number, accrual_rate, boarding_point;

    if(!fare_name){
        return [null, null, null];
    }else if(fare_name.slice(-1).match(/[A-Z]/)){
        fare_name = fare_name.slice(0, -1);
    }

    switch(fare_name){
        // 運賃1
        case 'プレミアム運賃':
        case 'プレミアムビジネスきっぷ':
        case 'プレミアム障がい者割引':
            fare_number = 1;
            accrual_rate = 150;
            boarding_point = 400;
            break;
        
        // 運賃2
        case 'プレミアム株主優待割引':
        case 'バリュープレミアム3':
        case '(往復)バリュープレミアム3':
        case 'スーパーバリュープレミアム28':
        case '(往復)スーパーバリュープレミアム28':
            fare_number = 2;
            accrual_rate = 125;
            boarding_point = 400;
            break;
        
        // 運賃3
        case 'フレックス':
        case 'ビジネスきっぷ':
        case '障がい者割引運賃':
        case '介護割引':
            fare_number = 3;
            accrual_rate = 100;
            boarding_point = 400;
            break;
        
        // 運賃4
        case 'アイきっぷ':
            fare_number = 4;
            accrual_rate = 100;
            boarding_point = 0;
            break;
        
        // 運賃5
        case 'バリュー':
        case '(往復)バリュー':
        case 'バリュー7':
        case '(往復)バリュー7':
        case 'バリュー3':
        case '(往復)バリュー3':
        case 'バリュー1':
        case '(往復)バリュー1':
        case '株主優待割引':
            fare_number = 5;
            accrual_rate = 75;
            boarding_point = 400;
            break;
        
        // 運賃6
        case 'バリュートランジット':
        case '(往復)バリュートランジット':
        case 'バリュートランジット7':
        case '(往復)バリュートランジット7':
        case 'バリュートランジット3':
        case '(往復)バリュートランジット3':
        case 'バリュートランジット1':
        case '(往復)バリュートランジット1':
        case 'スーパーバリュートランジット':
        case '(往復)スーパーバリュートランジット':
        case 'スーパーバリュートランジット75':
        case '(往復)スーパーバリュートランジット75':
        case 'スーパーバリュートランジット55':
        case '(往復)スーパーバリュートランジット55':
        case 'スーパーバリュートランジット45':
        case '(往復)スーパーバリュートランジット45':
        case 'スーパーバリュートランジット28':
        case '(往復)スーパーバリュートランジット28':
        case 'スーパーバリュートランジット21':
        case '(往復)スーパーバリュートランジット21':
            fare_number = 6;
            accrual_rate = 75;
            boarding_point = 200;
            break;
        
        // 運賃7
        case 'スーパーバリュー':
        case '(往復)スーパーバリュー':
        case 'スーパーバリュー75':
        case '(往復)スーパーバリュー75':
        case 'スーパーバリュー55':
        case '(往復)スーパーバリュー55':
        case 'スーパーバリュー45':
        case '(往復)スーパーバリュー45':
        case 'スーパーバリュー28':
        case '(往復)スーパーバリュー28':
        case 'スーパーバリュー21':
        case '(往復)スーパーバリュー21':
            fare_number = 7;
            accrual_rate = 75;
            boarding_point = 0;
            break;
        
        // 運賃8
        case 'スマートU25':
        case 'スマートシニア空割':
        case 'スーパーバリューセール':
            fare_number = 8;
            accrual_rate = 50;
            boarding_point = 0;
            break;
        
        // 運賃9~13：国際航空券（国内区間）
        default:
            fare_number = null;
            accrual_rate = null;
            boarding_point = null;
            break;
    }

    return [fare_number, accrual_rate, boarding_point];
}

main();
