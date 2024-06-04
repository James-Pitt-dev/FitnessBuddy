const timer = () => {
    let counter = 0;
    document.querySelector(duration);
    
}

const workoutAPI = async function(){
    // /exercises/exercise/{id}
        const url = `https://exercisedb.p.rapidapi.com/exercises?limit=10`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'a34bd91f76mshd066cdaa2775237p1f279djsn703a2c619030',
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        };
        
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error(error);
        }
     }