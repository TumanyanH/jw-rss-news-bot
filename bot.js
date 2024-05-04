const Parser = require('rss-parser');
const CronJob = require('cron').CronJob;

const rssFeedUrl = 'https://www.jw.org/en/whats-new/rss/WhatsNewWebArticles/feed.xml'; // Replace with your RSS feed URL

// Function to fetch and process the RSS feed
const fetchAndProcessFeed = async () => {
    const parser = new Parser();
    try {
        const feed = await parser.parseURL(rssFeedUrl);
        console.log(`Fetched feed: ${feed.title}`);
        // Process feed entries here, e.g., save to database, send notifications, etc.
        feed.items.forEach(item => {
            console.log(`Title: ${item.title}`);
            console.log(`Link: ${item.link}`);
            console.log(`Published: ${item.pubDate}`);
            console.log('----------------------------------');
        });
    } catch (error) {
        console.error('Error fetching feed:', error);
    }
};

// Schedule the job to fetch the feed every hour
const job = new CronJob('* * * * * *', fetchAndProcessFeed); // Runs every hour
job.start();