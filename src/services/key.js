import axios from "axios";
import colors from "colors";
import inquirer from "inquirer";
import fileHelper from "../helpers/file.js";
import gameService from "./game.js";
import server from "./server.js";

class KeyService {
  constructor() {}

  maskApiKey(apiKey) {
    // Split the string into 3 parts: the beginning, the middle to mask, and the end
    const parts = apiKey.split("_");
    if (parts.length !== 2) {
      throw new Error("Invalid API key format");
    }

    const prefix = parts[0]; // 'pro'
    const key = parts[1]; // 'a8ff5ce14b57853563c44988a890dca2'

    // Take the first 6 characters and the last 4 characters of the key
    const start = key.slice(0, 6);
    const end = key.slice(-6);

    // The middle part will be replaced with '*' characters
    const maskedMiddle = "*".repeat(key.length - start.length - end.length);

    // Combine the masked string back
    return `${prefix}_${start}${maskedMiddle}${end}`;
  }

  async checkKey(database, apiKey) {
    try {
      const URL = database?.server?.pro[0].url;
      const endpoint = `${URL}blum/check-limit`;

      const { data } = await axios.get(endpoint, {
        headers: {
          "X-API-KEY": apiKey,
        },
      });
      return data;
    } catch (error) {
      return null;
    }
  }

  async handleApiKey() {
    const database = await server.getData();

    const rawKeys = fileHelper.readFile("key.txt");
    const keys = rawKeys
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (keys.length) {
      const apiKey = keys[0];

      const check = await this.checkKey(database, apiKey);
      if (check === null) {
        console.log(
          colors.red(
            `Invalid API KEY, contact Telegram @zuydd to get/purchase an API KEY`
          )
        );
      } else {
        gameService.setApiKey(apiKey);
        gameService.setQuota(check?.data);
        const maskedKey = this.maskApiKey(apiKey);
        console.log(
          `API KEY: ${colors.green(maskedKey)} - Remaining ${colors.green(
            check?.data
          )} uses`
        );
      }
    } else {
      const response = await inquirer.prompt([
        {
          type: "input",
          name: "apiKey",
          message:
            "Enter your game API KEY? Leave empty if you don't have one (game play will be skipped during the tool's operation)",
        },
      ]);
      const { apiKey } = response;
      if (apiKey) {
        const check = await this.checkKey(database, apiKey);
        if (check === null) {
          console.log(
            colors.red(
              `Invalid API KEY, contact Telegram @zuydd to get/purchase an API KEY`
            )
          );
        } else {
          fileHelper.writeLog("key.txt", apiKey);
          gameService.setApiKey(apiKey);
          gameService.setQuota(check?.data);
          const maskedKey = this.maskApiKey(apiKey);
          console.log(
            `API KEY: ${colors.green(maskedKey)} - Remaining ${colors.green(
              check?.data
            )} uses`
          );
        }
      }
    }
  }
}

const keyService = new KeyService();
export default keyService;
