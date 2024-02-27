export default {
    data(){
        return {
            initializing: false,
        }
    },
    methods: {
        setDependency(id, url, attributes = {})
        {
            this.initializing = true;
            /* eslint-disable */
            return new Promise((resolve, reject) => {
                if(document.querySelector(`[dependency-${id}='true']`) !== null){
                    this.initializing = false;
                    resolve();
                    return;
                }
                let script = document.createElement('script')
                script.setAttribute('src', url);
                for(let key in attributes) {
                    script.setAttribute(key, attributes[key]);
                }
                document.head.appendChild(script);
                script.onload = () => {
                    script.setAttribute(`dependency-${id}`, 'true');
                    this.initializing = false;
                    resolve();
                };
                script.onerror = (e) => {
                    reject(e);
                };
            })
        },
    }
}