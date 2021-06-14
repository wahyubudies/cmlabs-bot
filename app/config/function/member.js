const loadMember = () => {
    conn.query('select * from bot', (err, result, fields) => {
        if(err){
            throw err
        }
        dataStore = []
        result.forEach(item => {
            dataStore.push({
                id: item.id,
                name: item.name,
                time_join: item.time_join
            })
        })
    })
}