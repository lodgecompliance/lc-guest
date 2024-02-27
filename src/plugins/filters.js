import moment from "moment";

export default {
    install(Vue) {
        Vue.filter('nullable', (value, defaultValue = '--') => {
            return value && value != '' ? value : defaultValue;
        })

        Vue.filter('money_value', (amount, currency = '') => {
            return `${currency?.toUpperCase()}${amount/100}`;
        })

        Vue.filter('money', (amount, currency = '') => {
            return isNaN(amount) ? '--' : `${currency ? currency.toUpperCase() : ''}${amount.toLocaleString()}`;
        })

        Vue.filter('replace_underscore', (string, replacement = ' ') => {
            if(!string) return '';
            return string.replace('_', replacement);
        })

        Vue.filter('ucfirst', (string = '') => {
            if(!string) return '';
            return string.charAt(0).toUpperCase()+string.slice(1);
        })

        Vue.filter('ucfirstword', (words = '') => {
            if(!words) return '';
            return words.split(" ").map(word => word.charAt(0).toUpperCase()+word.slice(1)).join(" ")
        })

        Vue.filter('timestamp_to_date', (timestamp, format = '') => {
            if (!timestamp) return '';
            const dateTime = new Date(parseInt(timestamp)*1000)

            const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        

            let now = new Date();
            let seconds_difference = now.getTime() - dateTime.getTime()
            let abs_seconds_difference = Math.abs(seconds_difference);
            let diff = '';

            if(abs_seconds_difference > 604800000){
                diff = Math.floor(abs_seconds_difference/604800000)+'w'; // estimate in weeks
            }else if(abs_seconds_difference > 86400000){
                diff = Math.floor(abs_seconds_difference/86400000)+'d'; // estimate in days
            }else if(abs_seconds_difference > 3600000){
                diff = Math.floor(abs_seconds_difference/3600000)+'h'; // estimate in hours
            }else if(abs_seconds_difference > 60000){
                diff = Math.floor(abs_seconds_difference/60000)+'m'; // estimate in minutes
            }else{
                diff = Math.floor(abs_seconds_difference/1000)+'s' //estimate in seconds
            }

            const specific = {
                second: dateTime.getSeconds(),
                minute: dateTime.getMinutes(),
                hour: dateTime.getHours(),
                day: dateTime.getDate(),
                month: dateTime.getMonth()+1,
                mName: monthNames[parseInt(dateTime.getMonth())],
                year: dateTime.getFullYear(),
                diff: `${diff} ${seconds_difference < 0 ? 'remaining' : 'ago'}`
            } 

            const date = `${specific.day}/${specific.month}/${specific.year}`;
            const time = `${specific.hour}:${specific.minute}:${specific.second}`;

            if(!format || format == '') return `${date} ${time}`

             return format.replace(/second|minute|hour|day|month|mName|year|diff/gi, (matched) => specific[matched]);
        });

        Vue.filter('timestamp', (timestamp, format = "YYYY-MM-DD hh:mm a") => {
            return moment.unix(timestamp).format(format)
        })
    }
  };