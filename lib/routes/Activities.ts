import * as Routes from "../util/Routes";
import type RESTManager from "../rest/RESTManager";
import type { RawActivityInstance } from "../types/activities";
import ActivityInstance from "../structures/ActivityInstance";

export default class Activities {
    #manager: RESTManager;
    constructor(manager: RESTManager) {
        this.#manager = manager;
    }

    async getInstances(activityID: string, guildID: string) {
        return this.#manager.authRequest<{ instances: RawActivityInstance[] }>({
            method: "GET",
            path:   Routes.ACTIVITY_INSTANCES(activityID, guildID)
        }).then(data => data.instances.map(raw => new ActivityInstance(raw, this.#manager.client)));
    }
}
