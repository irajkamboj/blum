import colors from "colors";
import delayHelper from "../helpers/delay.js";

class TribeService {
  constructor() {}

  // ... other methods

  async handleTribe(user) {
    const infoTribe = await this.getInfo(user);

    if (infoTribe === null) return;

    if (!infoTribe) {
      await this.joinTribe(user);
    } else {
      const top100 = await this.getLeaderboard(user);
      const canLeaveTribe = top100.includes(infoTribe.id);

      if (canLeaveTribe) {
        await this.leaveTribe(user);
        await delayHelper.delay(3);
        await this.joinTribe(
          user,
          "642e3141-5536-4d2f-9a5f-a62a35ede62c",
          true
        );
      }
    }
  }
}

const tribeService = new TribeService();
export default tribeService;
