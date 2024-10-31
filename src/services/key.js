import colors from "colors";
import inquirer from "inquirer";
import fileHelper from "../helpers/file.js";
import gameService from "./game.js";

class KeyService {
  constructor() {}

  maskApiKey(apiKey) {
    const parts = apiKey.split("_");
    if (parts.length !== 2) {
      throw new Error("Invalid API key format");
    }

    const prefix = parts[0];
    const key = parts[1];

    const start = key.slice(0, 6);
    const end = key.slice(-6);

    const maskedMiddle = "*".repeat(key.length - start.length - end.length);

    return `${prefix}_${start}${maskedMiddle}${end}`;
  }

  async handleApiKey() {
    const rawKeys = fileHelper.readFile("key.txt");
    const keys = rawKeys
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (keys.length) {
      const apiKey = keys[0];
      gameService.setApiKey(apiKey);
      console.log(`API KEY: ${colors.green(this.maskApiKey(apiKey))}`);
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
        fileHelper.writeLog("key.txt", apiKey);
        gameService.setApiKey(apiKey);
        console.log(`API KEY: ${colors.green(this.maskApiKey(apiKey))}`);
      }
    }
  }
}

const keyService = new KeyService();
export default keyService;
