const { Telegraf } = require('telegraf')
require('dotenv').config()
const mysql = require('mysql')
const bot = new Telegraf(process.env.BOT_TOKEN)

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
})

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

conn.connect(err => {    
    if(err){
        throw err
    }
    console.log('connected!')    
    loadMember()
})

const helpMessage = "Command List: \n /start - for start \n /memberlist - for list data member \n"

bot.help(ctx => {
    ctx.reply(helpMessage)
})

bot.command('memberlist', ctx=>{    
    loadMember()
    let message = 'Member List \n'
    dataStore.forEach( (item, index) =>{
        message += `${index+1} - ${item.name}\n`
    })    
    ctx.reply(message)        
})

bot.start(ctx => {
     ctx.reply(`Welcome ${ctx.update.message.from.first_name} 👋`)    
})
bot.hears(/Hello robot/i, (ctx) => {
     ctx.replyWithMarkdown(`Hello *${ctx.chat.title}* 🏘️`)     
})
bot.on('new_chat_members', (ctx) => {
    //reply when member join 
    ctx.replyWithMarkdown(`Welcome to the club *${ctx.update.message.new_chat_members[0].first_name}* 👋`)     
    //time join setting
    let dateObject = new Date(ctx.update.message.date * 1000)    
    let day = dateObject.toLocaleString("en-US", {weekday:"long"})
    let month = dateObject.toLocaleString("en-US", {month:"long"})
    let date = dateObject.toLocaleString("en-US", {day:"numeric"})
    let year = dateObject.toLocaleString("en-US", {year:"numeric"})
    
    let username = ctx.message.new_chat_members[0].username
    let name = ctx.message.new_chat_members[0].first_name
    let time_join = `${day}, ${date} ${month} ${year}`
    
    //process.exit()

    //sql
    let sql = `INSERT INTO bot (username, name, time_join) VALUES ('${username}','${name}','${time_join}')`
    conn.query(sql, (err, result)=>{
        if(err){
            throw err
        }
        console.log('berhasil ditambahkan')
    })
    loadMember()
 })
 bot.on('left_chat_member', ctx =>{
     console.log(ctx.message.left_chat_member)
     const sql = `DELETE FROM bot where username = '${ctx.message.left_chat_member.username}' `
     conn.query(sql, (err, result)=>{
         if(err){
             throw err
         }
         loadMember()
     })
 })
bot.launch()