import { stringIsNullOrEmpty } from "@pnp/core";
import { expect } from "chai";
import "@pnp/graph/admin";

describe("Admin", function () {

    before(async function () {

        if (!this.pnp.settings.enableWebTests || stringIsNullOrEmpty(this.pnp.settings.testUser)) {
            this.skip();
        }
    });

    it("Get SharePoint Settings", async function () {
        const sharePointSettings = await this.pnp.graph.admin.sharepoint.settings();
        return expect(sharePointSettings.availableManagedPathsForSiteCreation.length > 0).is.true;
    });

    it("Update SharePoint Settings", async function () {
        const sharePointSettings = await this.pnp.graph.admin.sharepoint.settings.update({deletedUserPersonalSiteRetentionPeriodInDays:30});
        return expect(sharePointSettings.deletedUserPersonalSiteRetentionPeriodInDays === 30).is.true;
    });
});
