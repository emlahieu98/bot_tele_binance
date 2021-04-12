#!/usr/bin/env node
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api"); 
import request from "request"
import logger from './lib/logger';
import OrderBook from './lib/orderBook';
import SocketClient from './lib/socketClient';
import { orderbookUpdateFromWebsocket, orderBookUpdateFromRESTfulAPI } from './lib/orderBookManager';

const token =
  process.env.TOKEN_BOT ||
  "1660325491:AAH-jRXj-IY3I2AEU3OHw-iYxctis9uALGc";

let bot = new TelegramBot(token, { polling: true });



export default async function createApp() {
  logger.info('Start application');
  bot.onText(/\/c (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const coin = match[1];
    const CURRENCY = "usdt";
    const SYMBOL = `${coin}${CURRENCY}`  || "BTCUSDT";
    const socketApi = new SocketClient(`ws/${SYMBOL.toLowerCase()}@depth`);
    const orderBook = await new OrderBook(SYMBOL.toUpperCase());
    await socketApi.setHandler('depthUpdate', (params) => {
      let b = params.b.shift();
      let a = params.a.shift();
      let u = params.s.replace("USDT","/USDT");;
      bot.sendMessage(
        chatId,
        `🚀🚀 ${u}🚀🚀 
        🚀 Sell max : ${b.shift()}
        🚀 Buy max : ${a.shift()} `
      );
      socketApi._ws.close();
     // orderbookUpdateFromWebsocket(params)(orderBook);
    });
    // return bot.sendMessage(chatId, ` ${coin}  ... `);
  })
  
  
  // leave a time gap to wait for websokect connection first
  // setTimeout(() => {
  //   orderBookUpdateFromRESTfulAPI(orderBook);
  // }, 3000);
  
  // //inspection
  //  orderBook.best_price();

  
}

createApp();
