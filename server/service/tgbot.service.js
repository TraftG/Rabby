const {Telegraf} = require('telegraf')
require('dotenv').config()

class TgbotService {
    bot = ""
    async tgbotInit() {
        this.bot = new Telegraf(process.env.BOT_TOKEN)
        this.bot.launch()
        console.log("Bot Started")
    }

    async upgradeToPro() {
        let titleText = "Some Title"
        let descriptionText = "Some Description"
        let payload = {userid:12345678}
        let providerToken = ""
        let currency = "XTR"
        let price = [{label:"1 Month",amount:100}]
        let obj = {title:titleText,description:descriptionText,payload:payload,provider_token:providerToken,currency:currency,prices:price}
        let result = await this.bot.telegram.createInvoiceLink(obj)

        return result
    }
}