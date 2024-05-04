const TelegramBot = require('node-telegram-bot-api');
const Parser = require('rss-parser');
const CronJob = require('cron').CronJob;
let last_id = '3aba9f01b27aafa1c6aaabcf8c35e9f8';


const token = '7083060049:AAG1qN1w2QNaeShGrq3mqTwSLEqoNQ_n5BI';
const rssFeedUrl = 'https://www.jw.org/en/whats-new/rss/WhatsNewWebArticles/feed.xml'; // Replace with your RSS feed URL

const bot = new TelegramBot(token, { polling: true });

let subscribers_list = [];

const saveSubscriber = (chatId) => {
    let exists = false;
    for (let i = 0; i < subscribers_list.length; i++)
    {
        if (subscribers_list[i] == chatId)
        {
            exists = true;
            bot.sendMessage(chatId, "You are already subscribed!");
            return 0;
        }
    }
    if (!exists)
        subscribers_list[subscribers_list.length] = chatId;
    return 1;
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    let res = saveSubscriber(chatId);
    if (res)
        bot.sendMessage(chatId, 'Hello! You will recieve all news from Jw.org');
});

const getCountOfNews = async (items) => {
    let counter = 0;
    let all_count = items.length;

    for (let i = 0; i < all_count; i++)
    {
        if (items[i].guid == last_id) break ;
        counter++;
    }
    return counter;
}

// bot.onText(/\/news/, async (msg, match) => {

    
// });

const fetchAndProcessFeed = async () => {
    console.log('trying');
    const parser = new Parser();
    try {
        const feed = await parser.parseURL(rssFeedUrl);
        const counter = await getCountOfNews(feed.items);
        console.log(counter);
        let message = '';
        let messages = [];
        
        for (let i = 0; i < counter; i++)
        {   
            let item = feed.items[i];
            let frags = item.pubDate.split(' ')
            const date = frags[0] + ' ' + frags[1] + ' ' + frags[2] + ' ' + frags[3]; 
            message += `[${item.title}](${item.link})\n`;
            // message += `\n`;
            message += `Published: *${date}*\n`;
            messages.push(message);
            message = '';
        }

        last_id = feed.items[0].guid;

        subscribers_list.forEach((chatId, index) => {
            messages.forEach((message) => {
                bot.sendMessage(chatId, message, {parse_mode: "Markdown"});
            })
        });

    } catch (error) {
        console.error('Error fetching feed:', error);
    }
}

// Listen for incoming messages
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, 'I reaceived your message.');
// });

const job = new CronJob('*/15 * * * * *', fetchAndProcessFeed); // Runs every hour
job.start();
